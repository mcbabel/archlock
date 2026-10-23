import { describe, expect, it } from "vitest";
import { moduleFromCode } from "../../src/engine/fromcode.js";
import { componentName, extractComponentFile } from "../../src/extract/components/component.js";
import { buildProject } from "../../src/extract/project.js";
import type { Resolver } from "../../src/extract/resolution.js";
import { renderSketch } from "../../src/sketch/render.js";

const noResolver: Resolver = { resolve: () => ({ kind: "unresolved" }) };

/** The symbol part of the sketch for a module that contains just this component. */
function sketchOf(file: string, code: string): string {
  const facts = extractComponentFile(file, code);
  const project = buildProject(
    [facts],
    [{ name: "m", paths: ["src/m/**"], entry: null }],
    () => noResolver,
  );
  const text = renderSketch(moduleFromCode(project.modules.get("m") as never));
  return text.split("\n").slice(3).join("\n").trim();
}

describe("Vue components → sketch", () => {
  it("defineProps with a type literal, defineEmits with call signatures", () => {
    expect(
      sketchOf(
        "src/m/Tag.vue",
        `<script setup lang="ts">
defineProps<{ label: string; color?: "red" | "blue" }>();
defineEmits<{ (e: "remove" | "edit", id: number): void }>();
</script>
<template><span /></template>`,
      ),
    ).toBe(`class Tag(VueComponent):
    color: Opt['"red" | "blue"']
    label: string
    onEdit: Opt['(id: number) => void']
    onRemove: Opt['(id: number) => void']`);
  });

  it("local interface and type alias, intersections; imported prop types become bases", () => {
    expect(
      sketchOf(
        "src/m/Panel.vue",
        `<script setup lang="ts">
import type { Base } from "./base";
type Extra = { collapsed?: boolean };
interface Props extends Base { title: string }
defineProps<Props & Extra>();
</script>`,
      ),
    ).toBe(`class Panel(VueComponent, Base):
    collapsed: Opt[boolean]
    title: string`);
  });

  it("runtime props: constructors, unions, required, PropType, array syntax", () => {
    expect(
      sketchOf(
        "src/m/Field.vue",
        `<script setup>
defineProps({
  name: { type: String, required: true },
  value: [String, Number],
  rows: { type: Array as PropType<Row[]> },
  meta: Object,
  ready: { required: true },
});
</script>`,
      ),
    ).toBe(`class Field(VueComponent):
    meta: Opt[Record[string, unknown]]
    name: string
    ready: '<inferred>'
    rows: Opt['Row[]']
    value: Opt[string | number]`);
    expect(sketchOf("src/m/Plain.vue", "<script setup>defineProps(['a', 'b'])</script>")).toBe(
      `class Plain(VueComponent):
    a: Opt['<inferred>']
    b: Opt['<inferred>']`,
    );
  });

  it("emits: named tuples, runtime arrays and validator objects", () => {
    expect(
      sketchOf(
        "src/m/Picker.vue",
        `<script setup lang="ts">
defineEmits<{ change: [value: string, index: number]; open: [] }>();
</script>`,
      ),
    ).toBe(`class Picker(VueComponent):
    onChange: Opt['(value: string, index: number) => void']
    onOpen: Opt['() => void']`);
    expect(
      sketchOf(
        "src/m/Form.vue",
        `<script setup>
defineEmits({ submit: (payload: { ok: boolean }) => true, reset: null });
</script>`,
      ),
    ).toBe(`class Form(VueComponent):
    onReset: Opt['<inferred>']
    onSubmit: Opt['(payload: { ok: boolean }) => void']`);
  });

  it("hyphenated events are camelized like Vue's listener props", () => {
    expect(
      sketchOf(
        "src/m/Range.vue",
        `<script setup>defineEmits(["calendar-change", "update:model-value"]);</script>`,
      ),
    ).toBe(`class Range(VueComponent):
    onCalendarChange: Opt['<inferred>']
    self["onUpdate:modelValue"]: Opt['<inferred>']`);
  });

  it("props and emits defined elsewhere are bases", () => {
    expect(
      sketchOf(
        "src/m/ElButton.vue",
        `<script setup lang="ts">
import { buttonProps, type ButtonEmits } from "./button";
defineProps(buttonProps);
defineEmits<ButtonEmits>();
</script>`,
      ),
    ).toBe("class ElButton(VueComponent, 'typeof buttonProps', ButtonEmits): ...");
    expect(
      sketchOf(
        "src/m/ElInput.vue",
        `<script>
import { defineComponent } from "vue";
import { inputProps, inputEmits } from "./input";
export default defineComponent({ props: inputProps, emits: inputEmits as never });
</script>`,
      ),
    ).toBe("class ElInput(VueComponent, 'typeof inputProps', 'typeof inputEmits'): ...");
  });

  it("defineModel adds the prop and its update event", () => {
    expect(
      sketchOf(
        "src/m/Toggle.vue",
        `<script setup lang="ts">
const on = defineModel<boolean>();
const count = defineModel<number>("count", { required: true });
</script>`,
      ),
    ).toBe(`class Toggle(VueComponent):
    count: number
    modelValue: Opt[boolean]
    self["onUpdate:count"]: Opt['(value: number) => void']
    self["onUpdate:modelValue"]: Opt['(value: boolean) => void']`);
  });

  it("Options API, generic components, other exports, template-only components", () => {
    expect(
      sketchOf(
        "src/m/Legacy.vue",
        `<script>
export default { props: { title: String }, emits: ["close"] };
</script>`,
      ),
    ).toBe(`class Legacy(VueComponent):
    onClose: Opt['<inferred>']
    title: Opt[string]`);
    expect(
      sketchOf(
        "src/m/List.vue",
        `<script lang="ts">
export const PAGE_SIZE = 20;
</script>
<script setup lang="ts" generic="T, K extends keyof T">
defineProps<{ rows: T[]; key: K }>();
</script>`,
      ),
    ).toBe(`class List[T, 'K extends keyof T'](VueComponent):
    key: K
    rows: 'T[]'

PAGE_SIZE: '<inferred>'`);
    expect(sketchOf("src/m/Logo.vue", "<template><svg /></template>")).toBe(
      "class Logo(VueComponent): ...",
    );
  });
});

describe("Svelte components → sketch", () => {
  it("Svelte 5 $props() with a type, without a type, and rest props", () => {
    expect(
      sketchOf(
        "src/m/Button.svelte",
        `<script lang="ts">
  interface Props { variant?: "primary" | "ghost"; onclick?: () => void }
  let { variant = "primary", onclick }: Props = $props();
</script>
<button {onclick}>{variant}</button>`,
      ),
    ).toBe(`class Button(SvelteComponent):
    onclick: Opt['() => void']
    variant: Opt['"primary" | "ghost"']`);
    expect(
      sketchOf(
        "src/m/Chip.svelte",
        "<script>let { text, dense = false, ...rest } = $props();</script>",
      ),
    ).toBe(`class Chip(SvelteComponent):
    dense: Opt['<inferred>']
    text: '<inferred>'`);
  });

  it("Svelte 4: export let, $$Props, typed dispatcher, module script exports", () => {
    expect(
      sketchOf(
        "src/m/Old.svelte",
        `<script context="module" lang="ts">
  export function format(n: number): string { return String(n); }
</script>
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let value: number;
  export let label = "";
  export const kind = "old";
  const dispatch = createEventDispatcher<{ commit: number }>();
</script>`,
      ),
    ).toBe(`class Old(SvelteComponent):
    label: Opt['<inferred>']
    onCommit: Opt['(event: CustomEvent[number]) => void']
    value: number

def format(n: number) -> string: ...`);
    expect(
      sketchOf(
        "src/m/Typed.svelte",
        `<script lang="ts">
  interface $$Props { size: number }
  export let size: number;
</script>`,
      ),
    ).toBe(`class Typed(SvelteComponent):
    size: number`);
  });

  it("generics attribute", () => {
    expect(
      sketchOf(
        "src/m/Select.svelte",
        `<script lang="ts" generics="T">
  let { items }: { items: T[] } = $props();
</script>`,
      ),
    ).toBe(`class Select[T](SvelteComponent):
    items: 'T[]'`);
  });
});

describe("Astro components → sketch", () => {
  it("Props interface, Astro.props destructuring, frontmatter exports", () => {
    expect(
      sketchOf(
        "src/m/Hero.astro",
        `---
export interface Props { heading: string; image?: string }
const { heading } = Astro.props;
---
<h1>{heading}</h1>`,
      ),
    ).toBe(`class Props(Protocol):
    heading: string
    image: Opt[string]

class Hero(AstroComponent):
    heading: string
    image: Opt[string]`);
    expect(
      sketchOf(
        "src/m/Note.astro",
        `---
const { text, kind = "info" } = Astro.props as { text: string; kind?: string };
---
<p>{text}</p>`,
      ),
    ).toBe(`class Note(AstroComponent):
    kind: Opt['<inferred>']
    text: '<inferred>'`);
  });
});

describe("component files", () => {
  it("imports keep their line and column in the component file", () => {
    const facts = extractComponentFile(
      "src/m/A.vue",
      `<template>\n  <div />\n</template>\n\n<script setup lang="ts">\n  import B from "./B.vue";\n</script>\n`,
    );
    expect(facts.imports).toEqual([
      { specifier: "./B.vue", names: ["default"], line: 6, column: 3, typeOnly: false },
    ]);
    expect(facts.lines).toBe(6);
  });

  it("ignores commented-out scripts, scripts in templates and svelte:head, and inline Astro scripts", () => {
    const specifiers = (file: string, code: string) =>
      extractComponentFile(file, code).imports.map((i) => i.specifier);
    expect(
      specifiers(
        "src/m/A.vue",
        `<!-- <script setup>import X from "./X.vue"</script> -->
<template><div><script>import("./y")</script></div></template>
<script setup>import Z from "./Z.vue";</script>`,
      ),
    ).toEqual(["./Z.vue"]);
    expect(
      specifiers(
        "src/m/B.svelte",
        `<script>import Z from "./Z.svelte";</script>
<svelte:head><script>import("./analytics.js")</script></svelte:head>`,
      ),
    ).toEqual(["./Z.svelte"]);
    expect(
      specifiers(
        "src/m/C.astro",
        `---
import Z from "./Z.astro";
---
<script>import "./client";</script>
<script is:inline>import("./inline")</script>
<script type="application/ld+json">{}</script>
<script src="./external.ts"></script>`,
      ),
    ).toEqual(["./Z.astro", "./client", "./external.ts"]);
  });

  it("TSX script blocks are parsed as TSX", () => {
    expect(
      sketchOf(
        "src/m/Render.vue",
        `<script setup lang="tsx">
const view = () => <div class="x" />;
defineProps<{ id: string }>();
</script>`,
      ),
    ).toBe(`class Render(VueComponent):
    id: string`);
  });

  it("a name defined in several files of a module without an entry is qualified by path", () => {
    const project = buildProject(
      [
        extractComponentFile("src/m/ui/button.svelte", "<script>export let size = 1;</script>"),
        extractComponentFile("src/m/demo/button.svelte", "<p />"),
        extractComponentFile(
          "src/m/Card.astro",
          "---\nexport interface Props { title: string }\n---",
        ),
        extractComponentFile(
          "src/m/Hero.astro",
          "---\nexport interface Props { image: string }\n---",
        ),
      ],
      [{ name: "m", paths: ["src/m/**"], entry: null }],
      () => noResolver,
    );
    const names = (project.modules.get("m")?.symbols ?? []).map((s) => s.name).sort();
    expect(names).toEqual([
      "Card",
      "Card__Props",
      "Hero",
      "Hero__Props",
      "demo_button__Button",
      "ui_button__Button",
    ]);
  });

  it("names components after their file; route files are not components", () => {
    expect(componentName("src/components/user-card.vue")).toBe("UserCard");
    expect(componentName("src/components/UserCard.vue")).toBe("UserCard");
    expect(componentName("src/components/dialog/index.vue")).toBe("Dialog");
    expect(componentName("src/routes/blog/+page.svelte")).toBeNull();
    expect(componentName("src/pages/index.astro")).toBeNull();
    expect(componentName("src/components/404.astro")).toBe("_404");
  });
});
