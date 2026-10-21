__module__ = "jsx"
__paths__ = ["src/jsx/**"]
__entry__ = "src/jsx/index.ts"
__depends_on__ = ["helper", "utils"]

AnimationEvent: TypeAlias = globalThis.AnimationEvent
Child: TypeAlias = 'string | Promise[string] | number | JSXNode | null | undefined | boolean | Child[]'
ClipboardEvent: TypeAlias = globalThis.ClipboardEvent
ComponentClass: TypeAlias['_P = {}', '_S = {}'] = unknown
CSSProperties: TypeAlias = JSX.CSSProperties
DOMAttributes: TypeAlias = HonoJSX.HTMLAttributes
DragEvent: TypeAlias = globalThis.DragEvent
Event: TypeAlias = globalThis.Event
FC: TypeAlias['P = Props'] = '{ (props: P): FunctionComponentResult; defaultProps?: Partial[P] | undefined; displayName?: string | undefined }'
FocusEvent: TypeAlias = globalThis.FocusEvent
InputEvent: TypeAlias = globalThis.InputEvent
KeyboardEvent: TypeAlias = globalThis.KeyboardEvent
MouseEvent: TypeAlias = globalThis.MouseEvent
PointerEvent: TypeAlias = globalThis.PointerEvent
PropsWithChildren: TypeAlias['P = unknown'] = 'P & { children?: Child | undefined }'
ReactElement: TypeAlias['P = any', 'T = string | Function'] = 'JSXNode & { type: T; props: P; key: string | null }'
ReactNode: TypeAlias = ReactElement | string | number | boolean | null | undefined
RefObject: TypeAlias[T] = '{ current: T }'
TouchEvent: TypeAlias = globalThis.TouchEvent
TransitionEvent: TypeAlias = globalThis.TransitionEvent
WheelEvent: TypeAlias = globalThis.WheelEvent

class Context[T]('FC[PropsWithChildren[{ value: T }]]', Protocol):
    Provider: 'FC[PropsWithChildren[{ value: T }]]'
    values: 'T[]'

class JSXNode(HtmlEscaped):
    children: 'Child[]'
    isEscaped: true
    key: Opt[string]
    props: Props
    ref: Readonly[any]
    tag: string | Function
    type: Readonly[string | Function]
    def __init__(self, tag: string | Function, props: Props, children: 'Child[]'): ...
    def toString(self) -> string | Promise[string]: ...
    def toStringToBuffer(self, buffer: StringBufferWithCallbacks) -> void: ...

def cloneElement['T extends JSXNode | JSX.Element'](
    element: T,
    props: Partial[Props],
    *children: 'Child[]',
) -> T: ...

def createContext[T](defaultValue: T) -> Context[T]: ...
def createElement(tag: string | Function, props: Props | null, *children: 'Child[]') -> JSXNode: ...
def createRef[T]() -> RefObject[T | null]: ...

def forwardRef[T, 'P = {}'](
    Component: '(props: P, ref?: RefObject[T | null]) => JSX.Element',
) -> '((props: P & { ref?: RefObject[T | null] }) => JSX.Element)': ...

def Fragment(
    __0: '{ key?: string; children?: Child | HtmlEscapedString }',
) -> HtmlEscapedString: ...

def isValidElement(element: unknown) -> 'element is JSXNode': ...
def jsx(tag: string | Function, props: Props | null, *children: 'Child[]') -> JSXNode: ...

def memo[T](
    component: FC[T],
    propsAreEqual: '(prevProps: Readonly[T], nextProps: Readonly[T]) => boolean' = ...,
) -> FC[T]: ...

def startTransition(callback: '() => void') -> void: ...
def startViewTransition(callback: '() => void') -> void: ...

def StrictMode(
    __0: '{ key?: string; children?: Child | HtmlEscapedString }',
) -> HtmlEscapedString: ...

def use[T](promise: Promise[T]) -> T: ...

def useActionState[T](
    fn: Function,
    initialState: T,
    permalink: string = ...,
) -> '[T, Function]': ...

def useCallback['T extends Function'](callback: T, deps: 'readonly unknown[]') -> T: ...
def useContext[T](context: Context[T]) -> T: ...
def useDebugValue(_value: unknown, _formatter: '(value: unknown) => string' = ...) -> void: ...
def useEffect(effect: '() => void | (() => void)', deps: 'readonly unknown[]' = ...) -> void: ...
def useId() -> string: ...

def useImperativeHandle[T](
    ref: RefObject[T | null],
    createHandle: '() => T',
    deps: 'readonly unknown[]',
) -> void: ...

def useInsertionEffect(
    effect: '() => void | (() => void)',
    deps: 'readonly unknown[]' = ...,
) -> void: ...

def useLayoutEffect(
    effect: '() => void | (() => void)',
    deps: 'readonly unknown[]' = ...,
) -> void: ...

def useMemo[T](factory: '() => T', deps: 'readonly unknown[]') -> T: ...

def useOptimistic[T, N](
    state: T,
    updateState: '(currentState: T, action: N) => T',
) -> '[T, (action: N) => void]': ...

def useReducer[T, A](
    reducer: '(state: T, action: A) => T',
    initialArg: T,
    init: '(initialState: T) => T' = ...,
) -> '[T, (action: A) => void]': ...

@overload
def useRef[T](initialValue: T) -> RefObject[T]: ...
@overload
def useRef[T](initialValue: T | null) -> RefObject[T | null]: ...
@overload
def useRef[T](initialValue: T | undefined) -> RefObject[T | undefined]: ...

def useSyncExternalStore[T](
    subscribe: '(callback: () => void) => () => void',
    getSnapshot: '() => T',
    getServerSnapshot: '() => T' = ...,
) -> T: ...

def useTransition() -> '[boolean, (callback: () => void | Promise[void]) => void]': ...
def useViewTransition() -> '[boolean, (callback: () => void) => void]': ...

Children: '<inferred>'
default: '<inferred>'
ErrorBoundary: 'FC[PropsWithChildren[{ fallback?: Child; fallbackRender?: FallbackRender; onError?: ErrorHandler }]]'
JSX: namespace
Suspense: 'FC[PropsWithChildren[{ fallback: any }]]'
useDeferredValue: UseDeferredValue
useState: UseStateType
version: '<inferred>'
