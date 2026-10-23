/**
 * Syntactic TypeScript/JavaScript extraction: one file → FileFacts.
 * Uses `ts.createSourceFile` only (no program, no type checker), so it is fast and stable.
 */

import ts from "typescript";
import { canonicalType, toSketchName } from "../../core/canonical.js";
import {
  type ArchSymbol,
  type ClassLikeSymbol,
  emptySoft,
  type FieldMember,
  INFERRED,
  type Location,
  type Member,
  type MethodMember,
  type Param,
  type Signature,
} from "../../core/model.js";
import { countLines } from "../../fs/files.js";
import { ANONYMOUS_DEFAULT, type FileFacts, type ImportFact } from "../facts.js";

function scriptKind(path: string): ts.ScriptKind {
  if (path.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (path.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (/\.[mc]?js$/.test(path)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return (
    ts.canHaveModifiers(node) && (ts.getModifiers(node)?.some((m) => m.kind === kind) ?? false)
  );
}

export function extractTypeScriptFile(
  path: string,
  text: string,
  kind: ts.ScriptKind = scriptKind(path),
): FileFacts {
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, kind);
  return new FileExtractor(path, sf).run(countLines(text));
}

class FileExtractor {
  private readonly facts: FileFacts;

  constructor(
    private readonly path: string,
    private readonly sf: ts.SourceFile,
  ) {
    this.facts = {
      path,
      language: "typescript",
      lines: 0,
      imports: [],
      exports: new Map(),
      stars: [],
      declarations: new Map(),
      bindings: new Map(),
    };
  }

  run(lines: number): FileFacts {
    this.facts.lines = lines;
    const functions = new Map<string, ts.FunctionDeclaration[]>();
    const interfaces = new Map<string, ts.InterfaceDeclaration[]>();

    for (const stmt of this.sf.statements) {
      const exported = hasModifier(stmt, ts.SyntaxKind.ExportKeyword);
      const isDefault = hasModifier(stmt, ts.SyntaxKind.DefaultKeyword);
      if (hasModifier(stmt, ts.SyntaxKind.DeclareKeyword) && ts.isModuleDeclaration(stmt)) continue;

      if (ts.isImportDeclaration(stmt)) this.importDeclaration(stmt);
      else if (ts.isImportEqualsDeclaration(stmt)) this.importEquals(stmt, exported);
      else if (ts.isExportDeclaration(stmt)) this.exportDeclaration(stmt);
      else if (ts.isExportAssignment(stmt)) this.exportAssignment(stmt);
      else if (ts.isFunctionDeclaration(stmt)) {
        const local = stmt.name?.text ?? ANONYMOUS_DEFAULT;
        const list = functions.get(local) ?? [];
        list.push(stmt);
        functions.set(local, list);
        this.markExport(local, exported, isDefault);
      } else if (ts.isInterfaceDeclaration(stmt)) {
        const list = interfaces.get(stmt.name.text) ?? [];
        list.push(stmt);
        interfaces.set(stmt.name.text, list);
        this.markExport(stmt.name.text, exported, isDefault);
      } else if (ts.isClassDeclaration(stmt)) {
        const local = stmt.name?.text ?? ANONYMOUS_DEFAULT;
        this.declare(local, this.classSymbol(stmt, local));
        this.markExport(local, exported, isDefault);
      } else if (ts.isTypeAliasDeclaration(stmt)) {
        this.declare(stmt.name.text, {
          kind: "type",
          name: stmt.name.text,
          typeParams: this.typeParams(stmt.typeParameters),
          type: canonicalType(stmt.type.getText(this.sf)),
          soft: emptySoft(),
          loc: this.loc(stmt),
        });
        this.markExport(stmt.name.text, exported, isDefault);
      } else if (ts.isEnumDeclaration(stmt)) {
        this.declare(stmt.name.text, {
          kind: "enum",
          name: stmt.name.text,
          bases: [],
          members: stmt.members.map((m) => ({
            name: toSketchName(this.propertyName(m.name) ?? ""),
            soft: emptySoft(),
          })),
          soft: emptySoft(),
          loc: this.loc(stmt),
        });
        this.markExport(stmt.name.text, exported, isDefault);
      } else if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
          for (const local of this.variable(decl)) this.markExport(local, exported, false);
        }
      } else if (ts.isModuleDeclaration(stmt) && ts.isIdentifier(stmt.name)) {
        this.declare(stmt.name.text, {
          kind: "const",
          name: stmt.name.text,
          type: "namespace",
          soft: emptySoft(),
          loc: this.loc(stmt),
        });
        this.markExport(stmt.name.text, exported, false);
      }
    }

    for (const [local, decls] of functions) {
      const withBody = decls.filter((d) => d.body !== undefined);
      const overloads = decls.filter((d) => d.body === undefined);
      const chosen = overloads.length > 0 ? overloads : withBody.slice(0, 1);
      const first = decls[0] as ts.FunctionDeclaration;
      this.declare(local, {
        kind: "function",
        name: local,
        signatures: chosen.map((d) => this.signature(d)),
        soft: emptySoft(),
        loc: this.loc(first),
      });
    }
    for (const [local, decls] of interfaces) {
      this.declare(local, this.interfaceSymbol(decls));
    }

    this.dynamicImports();
    return this.facts;
  }

  private loc(node: ts.Node): Location {
    const { line, character } = this.sf.getLineAndCharacterOfPosition(node.getStart(this.sf));
    return { file: this.path, line: line + 1, column: character + 1 };
  }

  private declare(local: string, symbol: ArchSymbol): void {
    const list = this.facts.declarations.get(local) ?? [];
    list.push(symbol);
    this.facts.declarations.set(local, list);
  }

  private markExport(local: string, exported: boolean, isDefault: boolean): void {
    if (!exported) return;
    this.facts.exports.set(isDefault ? "default" : local, { kind: "local", local });
  }

  private addImport(specifier: string, names: string[], node: ts.Node, typeOnly: boolean): void {
    const loc = this.loc(node);
    const fact: ImportFact = { specifier, names, line: loc.line, column: loc.column, typeOnly };
    this.facts.imports.push(fact);
  }

  private importDeclaration(stmt: ts.ImportDeclaration): void {
    if (!ts.isStringLiteral(stmt.moduleSpecifier)) return;
    const specifier = stmt.moduleSpecifier.text;
    const clause = stmt.importClause;
    const names: string[] = [];
    if (clause) {
      if (clause.name) {
        names.push("default");
        this.facts.bindings.set(clause.name.text, { specifier, name: "default" });
      }
      const nb = clause.namedBindings;
      if (nb && ts.isNamespaceImport(nb)) {
        names.push("*");
        this.facts.bindings.set(nb.name.text, { specifier, name: "*" });
      } else if (nb) {
        for (const el of nb.elements) {
          const imported = (el.propertyName ?? el.name).text;
          names.push(imported);
          this.facts.bindings.set(el.name.text, { specifier, name: imported });
        }
      }
    }
    this.addImport(specifier, names, stmt, clause?.isTypeOnly ?? false);
  }

  private importEquals(stmt: ts.ImportEqualsDeclaration, exported: boolean): void {
    const ref = stmt.moduleReference;
    if (!ts.isExternalModuleReference(ref) || !ts.isStringLiteral(ref.expression)) return;
    const specifier = ref.expression.text;
    this.facts.bindings.set(stmt.name.text, { specifier, name: "*" });
    this.addImport(specifier, ["*"], stmt, stmt.isTypeOnly);
    if (exported) this.facts.exports.set(stmt.name.text, { kind: "local", local: stmt.name.text });
  }

  private exportDeclaration(stmt: ts.ExportDeclaration): void {
    const spec =
      stmt.moduleSpecifier && ts.isStringLiteral(stmt.moduleSpecifier)
        ? stmt.moduleSpecifier.text
        : null;
    const clause = stmt.exportClause;
    if (spec !== null) {
      if (!clause) {
        this.facts.stars.push(spec);
        this.addImport(spec, [], stmt, stmt.isTypeOnly);
      } else if (ts.isNamespaceExport(clause)) {
        this.facts.exports.set(this.exportName(clause.name), {
          kind: "reexport",
          specifier: spec,
          name: "*",
        });
        this.addImport(spec, ["*"], stmt, stmt.isTypeOnly);
      } else {
        const names: string[] = [];
        for (const el of clause.elements) {
          const imported = this.exportName(el.propertyName ?? el.name);
          names.push(imported);
          this.facts.exports.set(this.exportName(el.name), {
            kind: "reexport",
            specifier: spec,
            name: imported,
          });
        }
        this.addImport(spec, names, stmt, stmt.isTypeOnly);
      }
      return;
    }
    if (clause && ts.isNamedExports(clause)) {
      for (const el of clause.elements) {
        const local = this.exportName(el.propertyName ?? el.name);
        this.facts.exports.set(this.exportName(el.name), { kind: "local", local });
      }
    }
  }

  private exportName(name: ts.ModuleExportName): string {
    return name.text;
  }

  private exportAssignment(stmt: ts.ExportAssignment): void {
    const expr = skipOuterExpressions(stmt.expression);
    if (ts.isIdentifier(expr)) {
      this.facts.exports.set("default", { kind: "local", local: expr.text });
      return;
    }
    const symbol = this.expressionSymbol(ANONYMOUS_DEFAULT, expr, undefined, stmt);
    this.declare(ANONYMOUS_DEFAULT, symbol);
    this.facts.exports.set("default", { kind: "local", local: ANONYMOUS_DEFAULT });
  }

  /** Declares the names bound by a variable declaration; returns the local names. */
  private variable(decl: ts.VariableDeclaration): string[] {
    if (ts.isIdentifier(decl.name)) {
      const name = decl.name.text;
      const init = decl.initializer ? skipOuterExpressions(decl.initializer) : undefined;
      this.declare(name, this.expressionSymbol(name, init, decl.type, decl));
      return [name];
    }
    const names: string[] = [];
    const visit = (pattern: ts.BindingPattern) => {
      for (const el of pattern.elements) {
        if (ts.isOmittedExpression(el)) continue;
        if (ts.isIdentifier(el.name)) {
          names.push(el.name.text);
          this.declare(el.name.text, {
            kind: "const",
            name: el.name.text,
            type: INFERRED,
            soft: emptySoft(),
            loc: this.loc(el),
          });
        } else visit(el.name);
      }
    };
    visit(decl.name);
    return names;
  }

  /** A symbol for `name = <expr>`: functions and classes keep their shape. */
  private expressionSymbol(
    name: string,
    init: ts.Expression | undefined,
    typeNode: ts.TypeNode | undefined,
    node: ts.Node,
  ): ArchSymbol {
    if (!typeNode && init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
      return {
        kind: "function",
        name,
        signatures: [this.signature(init)],
        soft: emptySoft(),
        loc: this.loc(node),
      };
    }
    if (!typeNode && init && ts.isClassExpression(init)) {
      return { ...this.classSymbol(init, name), loc: this.loc(node) };
    }
    return {
      kind: "const",
      name,
      type: typeNode ? canonicalType(typeNode.getText(this.sf)) : INFERRED,
      soft: emptySoft(),
      loc: this.loc(node),
    };
  }

  private typeParams(params: ts.NodeArray<ts.TypeParameterDeclaration> | undefined): string[] {
    return params ? params.map((p) => canonicalType(p.getText(this.sf))) : [];
  }

  private signature(node: ts.SignatureDeclaration): Signature {
    const params: Param[] = [];
    node.parameters.forEach((p, index) => {
      if (ts.isIdentifier(p.name) && p.name.text === "this") return;
      const name = ts.isIdentifier(p.name) ? toSketchName(p.name.text) : `__${index}`;
      params.push({
        kind: p.dotDotDotToken ? "rest" : "normal",
        name,
        type: p.type ? canonicalType(p.type.getText(this.sf)) : null,
        optional:
          !p.dotDotDotToken && (p.questionToken !== undefined || p.initializer !== undefined),
      });
    });
    return {
      typeParams: this.typeParams(node.typeParameters),
      params,
      // Constructors have no return annotation in a sketch (`def __init__(self, ...)`).
      returns: ts.isConstructorDeclaration(node)
        ? null
        : node.type
          ? canonicalType(node.type.getText(this.sf))
          : INFERRED,
      async: hasModifier(node, ts.SyntaxKind.AsyncKeyword),
    };
  }

  private propertyName(name: ts.PropertyName | undefined): string | null {
    if (!name) return null;
    if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name))
      return name.text;
    if (ts.isPrivateIdentifier(name)) return null;
    if (ts.isNoSubstitutionTemplateLiteral(name)) return name.text;
    return null; // computed names are not part of the sketch
  }

  private isHidden(member: ts.Node): boolean {
    if (
      hasModifier(member, ts.SyntaxKind.PrivateKeyword) ||
      hasModifier(member, ts.SyntaxKind.ProtectedKeyword)
    ) {
      return true;
    }
    const name = (member as { name?: ts.Node }).name;
    return name !== undefined && ts.isPrivateIdentifier(name);
  }

  private classSymbol(node: ts.ClassLikeDeclaration, name: string): ClassLikeSymbol {
    const bases: string[] = [];
    for (const kind of [ts.SyntaxKind.ExtendsKeyword, ts.SyntaxKind.ImplementsKeyword]) {
      for (const clause of node.heritageClauses ?? []) {
        if (clause.token !== kind) continue;
        for (const t of clause.types) bases.push(canonicalType(t.getText(this.sf)));
      }
    }
    const members = new MemberCollector();
    const accessors = new Map<
      string,
      { get?: ts.GetAccessorDeclaration; set?: ts.SetAccessorDeclaration }
    >();
    const methods = new Map<
      string,
      { decls: ts.SignatureDeclaration[]; first: ts.Node; flags: MethodFlags }
    >();
    const addMethod = (key: string, decl: ts.SignatureDeclaration, flags: MethodFlags) => {
      const entry = methods.get(key) ?? { decls: [], first: decl, flags };
      entry.decls.push(decl);
      methods.set(key, entry);
    };

    for (const m of node.members) {
      if (this.isHidden(m)) continue;
      const isStatic = hasModifier(m, ts.SyntaxKind.StaticKeyword);
      if (ts.isPropertyDeclaration(m)) {
        const pname = this.propertyName(m.name);
        if (pname === null) continue;
        const init = m.initializer ? skipOuterExpressions(m.initializer) : undefined;
        if (!m.type && init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
          addMethod(pname, init, {
            static: isStatic,
            abstract: false,
            optional: m.questionToken !== undefined,
          });
          continue;
        }
        members.add({
          kind: "field",
          name: pname,
          type: m.type ? canonicalType(m.type.getText(this.sf)) : INFERRED,
          readonly: hasModifier(m, ts.SyntaxKind.ReadonlyKeyword),
          optional: m.questionToken !== undefined,
          static: isStatic,
          soft: emptySoft(),
          loc: this.loc(m),
        });
      } else if (ts.isMethodDeclaration(m)) {
        const pname = this.propertyName(m.name);
        if (pname === null) continue;
        addMethod(pname, m, {
          static: isStatic,
          abstract: hasModifier(m, ts.SyntaxKind.AbstractKeyword),
          optional: m.questionToken !== undefined,
        });
      } else if (ts.isConstructorDeclaration(m)) {
        addMethod("__init__", m, { static: false, abstract: false, optional: false });
        for (const p of m.parameters) {
          const isProperty = ts.isParameterPropertyDeclaration(p, m);
          if (!isProperty || this.isHidden(p) || !ts.isIdentifier(p.name)) continue;
          members.add({
            kind: "field",
            name: p.name.text,
            type: p.type ? canonicalType(p.type.getText(this.sf)) : INFERRED,
            readonly: hasModifier(p, ts.SyntaxKind.ReadonlyKeyword),
            optional: p.questionToken !== undefined,
            static: false,
            soft: emptySoft(),
            loc: this.loc(p),
          });
        }
      } else if (ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m)) {
        const pname = this.propertyName(m.name);
        if (pname === null) continue;
        const key = `${isStatic ? "static:" : ""}${pname}`;
        const entry = accessors.get(key) ?? {};
        if (ts.isGetAccessorDeclaration(m)) entry.get = m;
        else entry.set = m;
        accessors.set(key, entry);
      } else if (ts.isIndexSignatureDeclaration(m)) {
        addMethod("__getitem__", m, { static: isStatic, abstract: false, optional: false });
      }
    }
    for (const [key, { get, set }] of accessors) {
      const decl = (get ?? set) as ts.AccessorDeclaration;
      members.add(
        this.accessorField(
          key.replace(/^static:/, ""),
          get,
          set,
          hasModifier(decl, ts.SyntaxKind.StaticKeyword),
        ),
      );
    }
    for (const [mname, { decls, first, flags }] of methods) {
      members.add(this.method(mname, decls, first, flags));
    }

    return {
      kind: "class",
      name,
      typeParams: this.typeParams(node.typeParameters),
      bases,
      decorators: [],
      members: members.list(),
      soft: emptySoft(),
      loc: this.loc(node),
    };
  }

  private accessorField(
    name: string,
    get: ts.GetAccessorDeclaration | undefined,
    set: ts.SetAccessorDeclaration | undefined,
    isStatic: boolean,
  ): FieldMember {
    const typeNode = get?.type ?? set?.parameters[0]?.type;
    return {
      kind: "field",
      name,
      type: typeNode ? canonicalType(typeNode.getText(this.sf)) : INFERRED,
      readonly: set === undefined,
      optional: false,
      static: isStatic,
      soft: emptySoft(),
      loc: this.loc((get ?? set) as ts.Node),
    };
  }

  private method(
    name: string,
    decls: ts.SignatureDeclaration[],
    first: ts.Node,
    flags: MethodFlags,
  ): MethodMember {
    // For overloaded methods only the overload signatures are public (not the implementation).
    const overloads = decls.filter(
      (d) => !("body" in d) || (d as ts.MethodDeclaration).body === undefined,
    );
    const chosen = overloads.length > 0 && overloads.length < decls.length ? overloads : decls;
    return {
      kind: "method",
      name: name.startsWith("__") && name.endsWith("__") ? name : toSketchName(name),
      signatures: chosen.map((d) => this.signature(d)),
      static: flags.static,
      classmethod: false,
      abstract: flags.abstract,
      optional: flags.optional,
      soft: emptySoft(),
      loc: this.loc(first),
    };
  }

  private interfaceSymbol(decls: ts.InterfaceDeclaration[]): ClassLikeSymbol {
    const first = decls[0] as ts.InterfaceDeclaration;
    const bases: string[] = [];
    const members = new MemberCollector();
    const methods = new Map<
      string,
      { decls: ts.SignatureDeclaration[]; first: ts.Node; flags: MethodFlags }
    >();
    const addMethod = (key: string, decl: ts.SignatureDeclaration, flags: MethodFlags) => {
      const entry = methods.get(key) ?? { decls: [], first: decl, flags };
      entry.decls.push(decl);
      methods.set(key, entry);
    };
    const accessors = new Map<
      string,
      { get?: ts.GetAccessorDeclaration; set?: ts.SetAccessorDeclaration }
    >();
    for (const decl of decls) {
      for (const clause of decl.heritageClauses ?? []) {
        for (const t of clause.types) {
          const base = canonicalType(t.getText(this.sf));
          if (!bases.includes(base)) bases.push(base);
        }
      }
      for (const m of decl.members) {
        if (ts.isPropertySignature(m)) {
          const pname = this.propertyName(m.name);
          if (pname === null) continue;
          members.add({
            kind: "field",
            name: pname,
            type: m.type ? canonicalType(m.type.getText(this.sf)) : INFERRED,
            readonly: hasModifier(m, ts.SyntaxKind.ReadonlyKeyword),
            optional: m.questionToken !== undefined,
            static: false,
            soft: emptySoft(),
            loc: this.loc(m),
          });
        } else if (ts.isMethodSignature(m)) {
          const pname = this.propertyName(m.name);
          if (pname === null) continue;
          addMethod(pname, m, {
            static: false,
            abstract: false,
            optional: m.questionToken !== undefined,
          });
        } else if (ts.isCallSignatureDeclaration(m)) {
          addMethod("__call__", m, { static: false, abstract: false, optional: false });
        } else if (ts.isConstructSignatureDeclaration(m)) {
          addMethod("__new__", m, { static: false, abstract: false, optional: false });
        } else if (ts.isIndexSignatureDeclaration(m)) {
          addMethod("__getitem__", m, { static: false, abstract: false, optional: false });
        } else if (ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m)) {
          const pname = this.propertyName(m.name);
          if (pname === null) continue;
          const entry = accessors.get(pname) ?? {};
          if (ts.isGetAccessorDeclaration(m)) entry.get = m;
          else entry.set = m;
          accessors.set(pname, entry);
        }
      }
    }
    for (const [pname, { get, set }] of accessors)
      members.add(this.accessorField(pname, get, set, false));
    for (const [mname, { decls: ds, first: f, flags }] of methods) {
      members.add(this.method(mname, ds, f, flags));
    }
    return {
      kind: "interface",
      name: first.name.text,
      typeParams: this.typeParams(first.typeParameters),
      bases,
      decorators: [],
      members: members.list(),
      soft: emptySoft(),
      loc: this.loc(first),
    };
  }

  /** `import("x")`, `require("x")` anywhere in the file. */
  private dynamicImports(): void {
    const text = this.sf.text;
    if (!text.includes("import(") && !text.includes("require(")) return;
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && node.arguments.length >= 1) {
        const arg = node.arguments[0] as ts.Expression;
        const isImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
        const isRequire = ts.isIdentifier(node.expression) && node.expression.text === "require";
        if ((isImport || isRequire) && ts.isStringLiteralLike(arg)) {
          this.addImport(arg.text, ["*"], node, false);
        }
      }
      if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      ) {
        this.addImport(node.argument.literal.text, ["*"], node, true);
      }
      ts.forEachChild(node, visit);
    };
    visit(this.sf);
  }
}

interface MethodFlags {
  static: boolean;
  abstract: boolean;
  optional: boolean;
}

/** Collects members in order; for duplicate field names (e.g. accessor pairs) the first wins. */
class MemberCollector {
  private readonly members: Member[] = [];
  add(member: Member): void {
    if (
      this.members.some(
        (m) => m.kind === member.kind && m.name === member.name && m.kind === "field",
      )
    )
      return;
    this.members.push(member);
  }
  list(): Member[] {
    return this.members;
  }
}

function skipOuterExpressions(expr: ts.Expression): ts.Expression {
  let e = expr;
  for (;;) {
    if (
      ts.isParenthesizedExpression(e) ||
      ts.isAsExpression(e) ||
      ts.isSatisfiesExpression(e) ||
      ts.isNonNullExpression(e)
    ) {
      e = e.expression;
    } else if (ts.isTypeAssertionExpression(e)) {
      e = e.expression;
    } else return e;
  }
}
