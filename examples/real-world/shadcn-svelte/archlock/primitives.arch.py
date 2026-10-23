__module__ = "primitives"
__paths__ = ["packages/primitives/**"]
__depends_on__ = []

AnswerControlRegistration: TypeAlias = '<{ disabled: boolean; element: HTMLInputElement; id: string … (140 chars, #a6e4b14d)>'
BitsEvent: TypeAlias['T extends Event = Event', 'U extends HTMLElement = HTMLElement'] = 'T & { currentTarget: U }'
BitsKeyboardEvent: TypeAlias['T extends HTMLElement = HTMLElement'] = BitsEvent[KeyboardEvent, T]
BitsMouseEvent: TypeAlias['T extends HTMLElement = HTMLElement'] = BitsEvent[MouseEvent, T]
ChoiceRegistration: TypeAlias = '{ disabled: boolean; value: string }'
ElementRef: TypeAlias = Box[HTMLElement | null]
ItemRegistration: TypeAlias = '<{ choices: readonly ChoiceRegistration[]; disabled: … (497 chars, #c3fbe496)>'
MessageScrollerButtonDirection: TypeAlias = '"start" | "end"'
MessageScrollerButtonProps: TypeAlias = 'MessageScrollerButtonPropsWithoutHTML & Without[PrimitiveButtonAttributes, MessageScrollerButtonPropsWithoutHTML]'
MessageScrollerButtonRenderState: TypeAlias = '{ active: boolean; direction: MessageScrollerButtonDirection }'
MessageScrollerContentProps: TypeAlias = 'MessageScrollerContentPropsWithoutHTML & Without[PrimitiveDivAttributes, MessageScrollerContentPropsWithoutHTML]'
MessageScrollerDefaultScrollPosition: TypeAlias = '"start" | "end" | "last-anchor"'
MessageScrollerItemProps: TypeAlias = 'MessageScrollerItemPropsWithoutHTML & Without[PrimitiveDivAttributes, MessageScrollerItemPropsWithoutHTML]'
MessageScrollerMode: TypeAlias = '"following-bottom" | "free-scrolling" | "anchored-to-message" | "settling-jump"'
MessageScrollerProviderProps: TypeAlias = '<{ children?: Snippet; autoScroll?: boolean; … (192 chars, #ed46097e)>'
MessageScrollerRef: TypeAlias[T] = '{ current: T }'
MessageScrollerRegisterMessage: TypeAlias = '(messageId: string, element: HTMLElement | null, removedElement?: HTMLElement | null) => void'
MessageScrollerRootProps: TypeAlias = 'MessageScrollerRootPropsWithoutHTML & Without[PrimitiveDivAttributes, MessageScrollerRootPropsWithoutHTML]'
MessageScrollerScrollable: TypeAlias = '{ start: boolean; end: boolean }'
MessageScrollerScrollAlign: TypeAlias = '"start" | "center" | "end" | "nearest"'
MessageScrollerScrollOptions: TypeAlias = '{ align?: MessageScrollerScrollAlign; behavior?: ScrollBehavior; scrollMargin?: number }'
MessageScrollerViewportProps: TypeAlias = 'MessageScrollerViewportPropsWithoutHTML & Without[PrimitiveDivAttributes, MessageScrollerViewportPropsWithoutHTML]'
MessageScrollerVisibilityState: TypeAlias = '{ currentAnchorId: string | null; visibleMessageIds: string[] }'
OnChangeFn: TypeAlias[T] = '(value: T) => void'
PendingFocus: TypeAlias = '{ name: string; target: "invalid" | "item" }'
PendingScrollTreeProps: TypeAlias = '<{ defaultScrollPosition?: MessageScrollerDefaultScrollPositi … (161 chars, #ed221b05)>'
PrimitiveButtonAttributes: TypeAlias = Primitive[HTMLButtonAttributes]
PrimitiveDivAttributes: TypeAlias = Primitive[HTMLAttributes[HTMLDivElement]]
PrimitiveFieldsetAttributes: TypeAlias = Primitive[HTMLFieldsetAttributes]
PrimitiveFormAttributes: TypeAlias = Primitive[HTMLFormAttributes]
PrimitiveInputAttributes: TypeAlias = Primitive[HTMLInputAttributes]
PrimitiveLabelAttributes: TypeAlias = Primitive[HTMLLabelAttributes]
PrimitiveLegendAttributes: TypeAlias = Primitive[HTMLAttributes[HTMLLegendElement]]
PrimitiveParagraphAttributes: TypeAlias = Primitive[HTMLAttributes[HTMLParagraphElement]]
PrimitiveSpanAttributes: TypeAlias = Primitive[HTMLAttributes[HTMLSpanElement]]
QuestionnaireChoiceDefinition: TypeAlias = '{ disabled?: boolean; value: string }'
QuestionnaireChoiceInputProps: TypeAlias = '<QuestionnaireChoiceInputPropsWithoutHTML & … (208 chars, #3c52c1ac)>'
QuestionnaireChoiceInputPropsWithoutHTML: TypeAlias = WithChildNoChildrenSnippetProps[Record[never, never], QuestionnaireChoiceState, HTMLInputElement]
QuestionnaireChoiceLabelProps: TypeAlias = 'QuestionnaireChoiceLabelPropsWithoutHTML & Without[PrimitiveSpanAttributes, QuestionnaireChoiceLabelPropsWithoutHTML]'
QuestionnaireChoiceLabelPropsWithoutHTML: TypeAlias = WithChild
QuestionnaireChoiceProps: TypeAlias = 'QuestionnaireChoicePropsWithoutHTML & Without[PrimitiveLabelAttributes, QuestionnaireChoicePropsWithoutHTML]'
QuestionnaireChoicePropsWithoutHTML: TypeAlias = '<WithChildNoChildrenSnippetProps[{ checked?: boolean; … (176 chars, #3749b8d2)>'
QuestionnaireChoiceShortcutProps: TypeAlias = '<QuestionnaireChoiceShortcutPropsWithoutHTML & … (123 chars, #ddcce442)>'
QuestionnaireChoiceShortcutPropsWithoutHTML: TypeAlias = WithChildNoChildrenSnippetProps[Record[never, never], QuestionnaireChoiceShortcutState]
QuestionnaireChoicesProps: TypeAlias = 'QuestionnaireChoicesPropsWithoutHTML & Without[PrimitiveDivAttributes, QuestionnaireChoicesPropsWithoutHTML]'
QuestionnaireChoicesPropsWithoutHTML: TypeAlias = WithChildNoChildrenSnippetProps[Record[never, never], QuestionnaireChoicesState]
QuestionnaireCollection: TypeAlias = '<{ enabledItems: readonly QuestionnaireItemDefinition[]; … (165 chars, #b9fa51b5)>'
QuestionnaireDescriptionProps: TypeAlias = '<QuestionnaireDescriptionPropsWithoutHTML & … (122 chars, #241cd8f1)>'
QuestionnaireDescriptionPropsWithoutHTML: TypeAlias = WithChild
QuestionnaireErrorProps: TypeAlias = 'QuestionnaireErrorPropsWithoutHTML & Without[PrimitiveParagraphAttributes, QuestionnaireErrorPropsWithoutHTML]'
QuestionnaireErrorPropsWithoutHTML: TypeAlias = WithChildNoChildrenSnippetProps[Record[never, never], Pick[QuestionnaireItemState, "invalid"]]
QuestionnaireInputProps: TypeAlias = '<QuestionnaireInputPropsWithoutHTML & … (129 chars, #cbdda2ac)>'
QuestionnaireInputPropsWithoutHTML: TypeAlias = '<WithChildNoChildrenSnippetProps[{ type?: … (203 chars, #958cb008)>'
QuestionnaireInputType: TypeAlias = '<"date" | "datetime-local" | "email" | "month" | "number" | … (123 chars, #3227c32c)>'
QuestionnaireItemDefinition: TypeAlias = '{ choices?: readonly QuestionnaireChoiceDefinition[]; disabled?: boolean; name: string; required?: boolean }'
QuestionnaireItemProps: TypeAlias = 'QuestionnaireItemPropsWithoutHTML & Without[PrimitiveFieldsetAttributes, QuestionnaireItemPropsWithoutHTML]'
QuestionnaireItemPropsWithoutHTML: TypeAlias = '<WithChildNoChildrenSnippetProps[{ invalid?: boolean; name: … (227 chars, #49f4d124)>'
QuestionnaireItemStatus: TypeAlias = '"unanswered" | "answered" | "skipped"'
QuestionnaireNavigationState: TypeAlias = '{ disabled: boolean; shortcut: "Enter" | null; status: QuestionnaireItemStatus | null; visible: boolean }'
QuestionnaireNextProps: TypeAlias = 'QuestionnaireNextPropsWithoutHTML & Without[PrimitiveButtonAttributes, QuestionnaireNextPropsWithoutHTML]'
QuestionnaireNextPropsWithoutHTML: TypeAlias = 'WithChildNoChildrenSnippetProps[{ disabled?: boolean }, QuestionnaireNavigationState]'
QuestionnairePreviousProps: TypeAlias = 'QuestionnairePreviousPropsWithoutHTML & Without[PrimitiveButtonAttributes, QuestionnairePreviousPropsWithoutHTML]'
QuestionnairePreviousPropsWithoutHTML: TypeAlias = 'WithChildNoChildrenSnippetProps[{ disabled?: boolean }, QuestionnaireNavigationState]'
QuestionnaireProgressProps: TypeAlias = 'QuestionnaireProgressPropsWithoutHTML & Without[PrimitiveDivAttributes, QuestionnaireProgressPropsWithoutHTML]'
QuestionnaireProgressPropsWithoutHTML: TypeAlias = WithChildNoChildrenSnippetProps[Record[never, never], QuestionnaireProgressState]
QuestionnaireRootProps: TypeAlias = 'QuestionnaireRootPropsWithoutHTML & Without[PrimitiveFormAttributes, QuestionnaireRootPropsWithoutHTML]'
QuestionnaireRootPropsWithoutHTML: TypeAlias = '<WithChildNoChildrenSnippetProps[{ defaultItem?: string; … (357 chars, #442b47e1)>'
QuestionnaireShortcutMode: TypeAlias = '"letters" | "numbers"'
QuestionnaireSkipProps: TypeAlias = 'QuestionnaireSkipPropsWithoutHTML & Without[PrimitiveButtonAttributes, QuestionnaireSkipPropsWithoutHTML]'
QuestionnaireSkipPropsWithoutHTML: TypeAlias = 'WithChildNoChildrenSnippetProps[{ disabled?: boolean }, QuestionnaireNavigationState]'
QuestionnaireSubmitProps: TypeAlias = 'QuestionnaireSubmitPropsWithoutHTML & Without[PrimitiveButtonAttributes, QuestionnaireSubmitPropsWithoutHTML]'
QuestionnaireSubmitPropsWithoutHTML: TypeAlias = 'WithChildNoChildrenSnippetProps[{ disabled?: boolean }, QuestionnaireNavigationState]'
QuestionnaireTitleProps: TypeAlias = 'QuestionnaireTitlePropsWithoutHTML & Without[PrimitiveLegendAttributes, QuestionnaireTitlePropsWithoutHTML]'
QuestionnaireTitlePropsWithoutHTML: TypeAlias = WithChild
RefAttachment: TypeAlias['T extends HTMLElement = HTMLElement'] = 'ReturnType[typeof attachRef[T]]'
src_lib_questionnaire_types__QuestionnaireChoiceShortcutState: TypeAlias = Pick[QuestionnaireChoiceState, "shortcut"]
src_lib_questionnaire_types__QuestionnaireChoicesState: TypeAlias = '{ shortcuts: QuestionnaireShortcutMode | null }'
src_lib_questionnaire_types__QuestionnaireChoiceState: TypeAlias = '{ checked: boolean; disabled: boolean; invalid: boolean; shortcut: string | null; type: "checkbox" | "radio" }'
src_lib_questionnaire_types__QuestionnaireInputState: TypeAlias = '{ disabled: boolean; filled: boolean; invalid: boolean }'
src_lib_questionnaire_types__QuestionnaireItemState: TypeAlias = '<{ active: boolean; disabled: boolean; invalid: boolean; … (127 chars, #3c85d280)>'
src_lib_questionnaire_types__QuestionnaireProgressState: TypeAlias = QuestionnaireRootState
src_lib_questionnaire_types__QuestionnaireRootState: TypeAlias = '{ current: number; first: boolean; last: boolean; total: number }'
StyleProperties: TypeAlias = 'Record[string, string | number | undefined] & { [str: `--${string}`]: string | number | undefined }'
SvelteVirtualizer: TypeAlias['TScrollElement extends Element | Window', 'TItemElement extends Element'] = '<Omit[Virtualizer[TScrollElement, TItemElement], … (156 chars, #ecbda870)>'
TestMessage: TypeAlias = '{ height?: number; id: string; key?: string; registerMessage?: boolean; role?: string; scrollAnchor?: boolean }'
TestRef: TypeAlias[T] = '{ current: T | null }'
TestScrollerApi: TypeAlias = '<{ scrollToEnd: (options?: MessageScrollerScrollOptions) => … (225 chars, #5b26b930)>'
TestScrollerOptions: TypeAlias = '<{ autoScroll?: boolean; contentAriaBusy?: boolean | "true" … (473 chars, #6d9f5183)>'
TestScrollerRefs: TypeAlias = '<{ apiRef: TestRef[TestScrollerApi]; stateRef: … (176 chars, #f3a23bd1)>'
WithChild: TypeAlias['Props extends Record[PropertyKey, unknown] = Record[never, never]', 'SnippetProps extends Record[PropertyKey, unknown] = { _default: never }', 'Ref = HTMLElement'] = '<Omit[Props, "child" | "children"] & { child?: SnippetProps … (371 chars, #8117d41e)>'
WithChildNoChildrenSnippetProps: TypeAlias['Props extends Record[PropertyKey, unknown] = Record[never, never]', 'SnippetProps extends Record[PropertyKey, unknown] = { _default: never }', 'Ref = HTMLElement'] = '<Omit[Props, "child" | "children"] & { child?: SnippetProps … (302 chars, #42214443)>'
Without: TypeAlias['T extends object', 'U extends object'] = 'Omit[T, keyof U]'
WithRefOpts: TypeAlias['Ref extends HTMLElement = HTMLElement'] = 'ReadableBoxedValues[{ id: string }] & WritableBoxedValues[{ ref: Ref | null }]'

class MessageScroller(SvelteComponent, MessageScrollerRootProps): ...

class MessageScrollerBrowserHost(SvelteComponent):
    initial: ThreadProps

class MessageScrollerBrowserJump(SvelteComponent):
    messageId: string

class MessageScrollerBrowserMemoItem(SvelteComponent):
    anchor: boolean
    height: Opt[number]
    id: string

class MessageScrollerBrowserMemoTree(SvelteComponent):
    ids: 'string[]'

class MessageScrollerBrowserThread(SvelteComponent):
    autoScroll: Opt[boolean]
    defaultScrollPosition: Opt[MessageScrollerDefaultScrollPosition]
    itemClass: Opt[string]
    itemHeight: Opt[number]
    items: 'BrowserTestItem[]'
    scrollPreviousItemPeek: Opt[number]
    showButton: Opt[boolean]
    showJumpButton: Opt[boolean]
    showVisibility: Opt[boolean]

class MessageScrollerBrowserVirtualizerHost(SvelteComponent):
    initial: 'VirtualizerMessage[]'

class MessageScrollerBrowserVisibility(SvelteComponent): ...
class MessageScrollerButton(SvelteComponent, MessageScrollerButtonProps): ...

class MessageScrollerButtonState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    isActive: Readonly['<inferred>']
    opts: Readonly[MessageScrollerButtonStateOpts]
    props: Readonly['<inferred>']
    root: Readonly[MessageScrollerProviderState]
    snippetProps: Readonly['<inferred>']
    def __init__(
        self,
        opts: MessageScrollerButtonStateOpts,
        root: MessageScrollerProviderState,
    ): ...
    @staticmethod
    def create(opts: MessageScrollerButtonStateOpts) -> '<inferred>': ...
    def handleClick(
        self,
        event: 'MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }',
    ) -> '<inferred>': ...

class MessageScrollerContent(SvelteComponent, MessageScrollerContentProps): ...

class MessageScrollerContentState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    element: Readonly['<inferred>']
    opts: Readonly[MessageScrollerContentStateOpts]
    props: Readonly['<inferred>']
    root: Readonly[MessageScrollerProviderState]
    spacerAttachment: Readonly[RefAttachment[HTMLDivElement]]
    def __init__(
        self,
        opts: MessageScrollerContentStateOpts,
        root: MessageScrollerProviderState,
    ): ...
    @staticmethod
    def create(opts: MessageScrollerContentStateOpts) -> '<inferred>': ...
    def ensureSpacer(self, content: HTMLDivElement) -> '<inferred>': ...

class MessageScrollerDocsVirtualizer(SvelteComponent):
    messages: 'Array[{ id: string; text: string }]'

class MessageScrollerItem(SvelteComponent, MessageScrollerItemProps): ...

class MessageScrollerItemState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    element: Readonly['<inferred>']
    opts: Readonly[MessageScrollerItemStateOpts]
    props: Readonly['<inferred>']
    root: Readonly[MessageScrollerProviderState]
    def __init__(self, opts: MessageScrollerItemStateOpts, root: MessageScrollerProviderState): ...
    @staticmethod
    def create(opts: MessageScrollerItemStateOpts) -> '<inferred>': ...

class MessageScrollerProvider(SvelteComponent, MessageScrollerProviderProps): ...

class MessageScrollerProviderState:
    commands: Readonly['ReturnType[typeof createMessageScrollerCommands]']
    opts: Readonly[MessageScrollerProviderStateOpts]
    pendingDefaultScroll: '<inferred>'
    preserveScrollOnPrependRef: Readonly['<inferred>']
    previousDefaultScrollPosition: MessageScrollerDefaultScrollPosition
    refs: Readonly[MessageScrollerRefs]
    registerMessage: MessageScrollerRegisterMessage
    scrollable: '<inferred>'
    scrollToEnd: Readonly['<inferred>']
    scrollToMessage: Readonly['<inferred>']
    scrollToStart: Readonly['<inferred>']
    viewportRef: Readonly['<inferred>']
    visibility: Readonly['<inferred>']
    def __init__(self, opts: MessageScrollerProviderStateOpts): ...
    def applyDefaultScrollPosition(self) -> '<inferred>': ...
    def bindPreserveScrollOnPrepend(
        self,
        getPreserveScrollOnPrepend: '() => boolean',
    ) -> '<inferred>': ...
    def capturePrependAnchor(self) -> '<inferred>': ...
    def commitScrollState(self) -> '<inferred>': ...
    @staticmethod
    def create(opts: MessageScrollerProviderStateOpts) -> '<inferred>': ...
    @staticmethod
    def get() -> '<inferred>': ...
    def handleContentChange(self) -> '<inferred>': ...
    def handleResize(self) -> '<inferred>': ...
    def markDefaultScrollPositionApplied(self) -> '<inferred>': ...
    def mirrorStateAttributes(self) -> '<inferred>': ...
    def observeVisibility(self) -> '<inferred>': ...
    def reconcileFollowMode(self, scrollable: MessageScrollerScrollable) -> '<inferred>': ...
    def restorePrependedAnchor(self) -> '<inferred>': ...
    def schedulePendingScrollToMessageFlush(self) -> '<inferred>': ...
    def scheduleStateCommit(self) -> '<inferred>': ...
    def scheduleVisibilitySync(self) -> '<inferred>': ...
    def setContentElement(self, element: HTMLDivElement | null) -> '<inferred>': ...
    def setRootElement(self, element: HTMLDivElement | null) -> '<inferred>': ...
    def setSpacerElement(self, element: HTMLDivElement | null) -> '<inferred>': ...
    def setViewportElement(self, element: HTMLDivElement | null) -> '<inferred>': ...
    def syncAfterScroll(self) -> '<inferred>': ...
    def unobserveVisibility(self) -> '<inferred>': ...
    def userScrollIntent(self) -> '<inferred>': ...
    def writeStateAttributes(self, state: MessageScrollerScrollable) -> '<inferred>': ...
    def writeVisibilityState(self, next: MessageScrollerVisibilityState) -> '<inferred>': ...

class MessageScrollerRootState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    opts: Readonly[MessageScrollerRootStateOpts]
    props: Readonly['<inferred>']
    root: Readonly[MessageScrollerProviderState]
    def __init__(self, opts: MessageScrollerRootStateOpts, root: MessageScrollerProviderState): ...
    @staticmethod
    def create(opts: MessageScrollerRootStateOpts) -> '<inferred>': ...

class MessageScrollerTestApiProbe(SvelteComponent):
    apiRef: TestRef[TestScrollerApi]

class MessageScrollerTestHost(SvelteComponent, TestScrollerRefs):
    initial: TestScrollerOptions

class MessageScrollerTestPending(SvelteComponent, PendingScrollTreeProps): ...

class MessageScrollerTestRestore(SvelteComponent):
    messageId: string
    options: Opt[MessageScrollerScrollOptions]

class MessageScrollerTestScroller(SvelteComponent, TestScrollerOptions, TestScrollerRefs): ...

class MessageScrollerTestStateProbe(SvelteComponent):
    stateRef: TestRef[MessageScrollerScrollable]
    stateRenderCountRef: TestRef[number]

class MessageScrollerTestVisibilityProbe(SvelteComponent):
    visibilityRef: TestRef[MessageScrollerVisibilityState]

class MessageScrollerViewport(SvelteComponent, MessageScrollerViewportProps): ...

class MessageScrollerViewportState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    element: Readonly['<inferred>']
    opts: Readonly[MessageScrollerViewportStateOpts]
    props: Readonly['<inferred>']
    root: Readonly[MessageScrollerProviderState]
    def __init__(
        self,
        opts: MessageScrollerViewportStateOpts,
        root: MessageScrollerProviderState,
    ): ...
    @staticmethod
    def create(opts: MessageScrollerViewportStateOpts) -> '<inferred>': ...
    def handleKeyDown(self, event: KeyboardEvent) -> '<inferred>': ...
    def handleScroll(self, event: Event) -> '<inferred>': ...
    def handleTouchMove(self, event: TouchEvent) -> '<inferred>': ...
    def handleWheel(self, event: WheelEvent) -> '<inferred>': ...

class Questionnaire(SvelteComponent, QuestionnaireRootProps): ...

class QuestionnaireActionState:
    action: Readonly[QuestionnaireAction]
    attachment: Readonly[RefAttachment[HTMLElement]]
    navigation: Readonly['<inferred>']
    opts: Readonly[QuestionnaireActionStateOpts]
    props: Readonly['<inferred>']
    root: Readonly[QuestionnaireRootState]
    state: Readonly['<inferred>']
    visible: Readonly['<inferred>']
    def __init__(
        self,
        action: QuestionnaireAction,
        opts: QuestionnaireActionStateOpts,
        root: QuestionnaireRootState,
    ): ...
    @staticmethod
    def create(action: QuestionnaireAction, opts: QuestionnaireActionStateOpts) -> '<inferred>': ...
    def handleClick(self, event: BitsMouseEvent[HTMLButtonElement]) -> '<inferred>': ...

class QuestionnaireCases(SvelteComponent):
    model: QuestionnaireTestModel

class QuestionnaireChoice(SvelteComponent, QuestionnaireChoiceProps): ...
class QuestionnaireChoiceInput(SvelteComponent, QuestionnaireChoiceInputProps): ...

class QuestionnaireChoiceInputState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    checked: Readonly['<inferred>']
    choice: Readonly[QuestionnaireChoiceState]
    opts: Readonly[QuestionnaireChoiceInputStateOpts]
    props: Readonly['<inferred>']
    snippetProps: Readonly['<inferred>']
    def __init__(
        self,
        opts: QuestionnaireChoiceInputStateOpts,
        choice: QuestionnaireChoiceState,
    ): ...
    @staticmethod
    def create(opts: QuestionnaireChoiceInputStateOpts) -> '<inferred>': ...

class QuestionnaireChoiceLabel(SvelteComponent, QuestionnaireChoiceLabelProps): ...

class QuestionnaireChoiceLabelState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    opts: Readonly[QuestionnaireChoiceLabelStateOpts]
    props: Readonly['<inferred>']
    def __init__(self, opts: QuestionnaireChoiceLabelStateOpts): ...
    @staticmethod
    def create(opts: QuestionnaireChoiceLabelStateOpts) -> '<inferred>': ...

class QuestionnaireChoices(SvelteComponent, QuestionnaireChoicesProps): ...
class QuestionnaireChoiceShortcut(SvelteComponent, QuestionnaireChoiceShortcutProps): ...
class QuestionnaireDescription(SvelteComponent, QuestionnaireDescriptionProps): ...

class QuestionnaireDescriptionState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    item: Readonly[QuestionnaireItemState]
    opts: Readonly[QuestionnaireDescriptionStateOpts]
    props: Readonly['<inferred>']
    def __init__(self, opts: QuestionnaireDescriptionStateOpts, item: QuestionnaireItemState): ...
    @staticmethod
    def create(opts: QuestionnaireDescriptionStateOpts) -> '<inferred>': ...

class QuestionnaireError(SvelteComponent, QuestionnaireErrorProps): ...

class QuestionnaireErrorState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    defaultMessage: Readonly['<inferred>']
    item: Readonly[QuestionnaireItemState]
    opts: Readonly[QuestionnaireErrorStateOpts]
    props: Readonly['<inferred>']
    snippetProps: Readonly['<inferred>']
    def __init__(self, opts: QuestionnaireErrorStateOpts, item: QuestionnaireItemState): ...
    @staticmethod
    def create(opts: QuestionnaireErrorStateOpts) -> '<inferred>': ...

class QuestionnaireInput(SvelteComponent, QuestionnaireInputProps): ...
class QuestionnaireItem(SvelteComponent, QuestionnaireItemProps): ...
class QuestionnaireNext(SvelteComponent, QuestionnaireNextProps): ...
class QuestionnairePrevious(SvelteComponent, QuestionnairePreviousProps): ...
class QuestionnaireProgress(SvelteComponent, QuestionnaireProgressProps): ...
class QuestionnaireSkip(SvelteComponent, QuestionnaireSkipProps): ...
class QuestionnaireSubmit(SvelteComponent, QuestionnaireSubmitProps): ...

class QuestionnaireTestChoice(SvelteComponent, Omit[QuestionnaireChoiceProps, "children"]):
    children: Opt[Snippet]
    self["data-testid"]: Opt[string]

class QuestionnaireTestItem(SvelteComponent, QuestionnaireItemProps): ...

class QuestionnaireTestModel:
    answersDisabled: '<inferred>'
    checked: '<inferred>'
    controlledValue: '<inferred>'
    defaultItem: '<inferred>'
    defaultsChanged: '<inferred>'
    definitions: '<inferred>'
    firstInvalid: '<inferred>'
    includeChoice: '<inferred>'
    includeMiddle: '<inferred>'
    inputType: '<inferred>'
    inputValue: '<inferred>'
    item: '<inferred>'
    items: '<inferred>'
    middleItems: '<inferred>'
    multiple: '<inferred>'
    noValidate: '<inferred>'
    numericChoices: '<inferred>'
    onChange: '((event: Event) => void) | undefined'
    onItemChange: '((item: string) => void) | undefined'
    onStatusChange: '((status: QuestionnaireItemStatus) => void) | undefined'
    onSubmit: '((event: SubmitEvent) => void) | undefined'
    preventKeyDown: '<inferred>'
    refs: '<inferred>'
    scenario: '<inferred>'
    shortcutCount: '<inferred>'
    shortcuts: '<inferred>'
    showAdditionalDetails: '<inferred>'
    showInput: '<inferred>'
    skippedValue: '<inferred>'
    def handleCheckedChange(self, event: Event) -> '<inferred>': ...
    def handleCoordinatedInputChange(self, event: Event) -> '<inferred>': ...
    def handleInputChange(self, event: Event) -> '<inferred>': ...
    def handleItemChange(self, nextItem: string) -> '<inferred>': ...
    def handleRootKeyDown(self, event: KeyboardEvent) -> '<inferred>': ...

class QuestionnaireTitle(SvelteComponent, QuestionnaireTitleProps): ...

class QuestionnaireTitleState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    opts: Readonly[QuestionnaireTitleStateOpts]
    props: Readonly['<inferred>']
    def __init__(self, opts: QuestionnaireTitleStateOpts): ...
    @staticmethod
    def create(opts: QuestionnaireTitleStateOpts) -> '<inferred>': ...

class src_lib_questionnaire_questionnaire_svelte__QuestionnaireChoiceShortcutState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    choice: Readonly[QuestionnaireChoiceState]
    opts: Readonly[QuestionnaireChoiceShortcutStateOpts]
    props: Readonly['<inferred>']
    shortcut: Readonly['<inferred>']
    snippetProps: Readonly['<inferred>']
    def __init__(
        self,
        opts: QuestionnaireChoiceShortcutStateOpts,
        choice: QuestionnaireChoiceState,
    ): ...
    @staticmethod
    def create(opts: QuestionnaireChoiceShortcutStateOpts) -> '<inferred>': ...

class src_lib_questionnaire_questionnaire_svelte__QuestionnaireChoicesState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    item: Readonly[QuestionnaireItemState]
    opts: Readonly[QuestionnaireChoicesStateOpts]
    props: Readonly['<inferred>']
    snippetProps: Readonly['<inferred>']
    def __init__(self, opts: QuestionnaireChoicesStateOpts, item: QuestionnaireItemState): ...
    @staticmethod
    def create(opts: QuestionnaireChoicesStateOpts) -> '<inferred>': ...

class src_lib_questionnaire_questionnaire_svelte__QuestionnaireChoiceState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    checked: Readonly['<inferred>']
    controlled: Readonly['<inferred>']
    disabled: Readonly['<inferred>']
    initialDefaultChecked: Readonly[boolean]
    inputElement: '<inferred>'
    inputProps: Readonly['<inferred>']
    item: Readonly[QuestionnaireItemState]
    opts: Readonly[QuestionnaireChoiceStateOpts]
    props: Readonly['<inferred>']
    selected: Readonly['<inferred>']
    shortcut: Readonly['<inferred>']
    type: Readonly['<inferred>']
    viewState: Readonly['<inferred>']
    def __init__(self, opts: QuestionnaireChoiceStateOpts, item: QuestionnaireItemState): ...
    @staticmethod
    def create(opts: QuestionnaireChoiceStateOpts) -> '<inferred>': ...
    @staticmethod
    def get() -> '<inferred>': ...
    def handleChange(self, event: Event) -> '<inferred>': ...

class src_lib_questionnaire_questionnaire_svelte__QuestionnaireInputState:
    attachment: Readonly[RefAttachment[HTMLInputElement]]
    controlled: Readonly['<inferred>']
    controlledFilled: Readonly['<inferred>']
    defaultFilled: Readonly['<inferred>']
    disabled: Readonly['<inferred>']
    filled: Readonly['<inferred>']
    initialDefaultFilled: Readonly[boolean]
    inputElement: Readonly['<inferred>']
    item: Readonly[QuestionnaireItemState]
    opts: Readonly[QuestionnaireInputStateOpts]
    props: Readonly['<inferred>']
    selected: Readonly['<inferred>']
    uncontrolledFilled: '<inferred>'
    viewState: Readonly['<inferred>']
    def __init__(self, opts: QuestionnaireInputStateOpts, item: QuestionnaireItemState): ...
    @staticmethod
    def create(opts: QuestionnaireInputStateOpts) -> '<inferred>': ...
    def handleInput(self, event: Event) -> '<inferred>': ...

class src_lib_questionnaire_questionnaire_svelte__QuestionnaireItemState:
    active: Readonly['<inferred>']
    answerControlRegistrations: '<inferred>'
    answerControls: Readonly['<inferred>']
    answered: Readonly['<inferred>']
    answers: Readonly['<inferred>']
    attachment: Readonly[RefAttachment[HTMLFieldSetElement]]
    defaultSelectedAnswerIds: 'string[]'
    describedBy: Readonly['<inferred>']
    descriptionIds: '<inferred>'
    element: Readonly['<inferred>']
    errorIds: '<inferred>'
    hasInputAnswer: Readonly['<inferred>']
    intentionallySkipped: Readonly['<inferred>']
    invalid: Readonly['<inferred>']
    itemDefinition: Readonly['<inferred>']
    keyShortcuts: Readonly['<inferred>']
    opts: Readonly[QuestionnaireItemStateOpts]
    previousMultiple: boolean
    previousStatus: QuestionnaireItemStatus | null
    props: Readonly['<inferred>']
    resetVersion: '<inferred>'
    root: Readonly[QuestionnaireRootState]
    selectedAnswerIds: '<inferred>'
    shortcutByAnswerId: Readonly['<inferred>']
    shortcutByChoiceValue: Readonly['<inferred>']
    skipped: '<inferred>'
    status: Readonly['<inferred>']
    valid: Readonly['<inferred>']
    validationAttempted: '<inferred>'
    viewState: Readonly['<inferred>']
    def __init__(self, opts: QuestionnaireItemStateOpts, root: QuestionnaireRootState): ...
    @staticmethod
    def create(opts: QuestionnaireItemStateOpts) -> '<inferred>': ...
    def emitStatusChange(self) -> '<inferred>': ...
    def focus(self) -> '<inferred>': ...
    def focusInvalid(self) -> '<inferred>': ...
    @staticmethod
    def get() -> '<inferred>': ...
    def getAnswerByElement(self, answerElement: Element) -> '<inferred>': ...
    def getAnswerByShortcut(self, shortcut: string) -> '<inferred>': ...
    def moveAnswerFocus(
        self,
        currentElement: Element,
        direction: '"next" | "previous"',
    ) -> '<inferred>': ...
    def registerAnswerControl(self, registration: AnswerControlRegistration) -> '<inferred>': ...
    def registerAnswerSelection(
        self,
        answerId: string,
        defaultSelected: boolean,
    ) -> '<inferred>': ...
    def registerDescription(self, registeredDescriptionId: string) -> '<inferred>': ...
    def registerError(self, registeredErrorId: string) -> '<inferred>': ...
    def reset(self) -> '<inferred>': ...
    def setAnswerDefault(self, answerId: string, defaultSelected: boolean) -> '<inferred>': ...
    def setAnswerSelectionFromInteraction(
        self,
        answerId: string,
        selected: boolean,
    ) -> '<inferred>': ...
    def skip(self) -> '<inferred>': ...
    def syncControlledAnswerSelection(
        self,
        answerId: string,
        selected: boolean,
    ) -> '<inferred>': ...
    def updateAnswerSelected(self, answerId: string, selected: boolean) -> '<inferred>': ...
    def validate(self) -> '<inferred>': ...

class src_lib_questionnaire_questionnaire_svelte__QuestionnaireProgressState:
    attachment: Readonly[RefAttachment[HTMLElement]]
    label: Readonly['<inferred>']
    opts: Readonly[QuestionnaireProgressStateOpts]
    props: Readonly['<inferred>']
    root: Readonly[QuestionnaireRootState]
    viewState: Readonly['<inferred>']
    def __init__(self, opts: QuestionnaireProgressStateOpts, root: QuestionnaireRootState): ...
    @staticmethod
    def create(opts: QuestionnaireProgressStateOpts) -> '<inferred>': ...

class src_lib_questionnaire_questionnaire_svelte__QuestionnaireRootState:
    activeItem: Readonly['<inferred>']
    activeItemName: Readonly['<inferred>']
    activeItemRequired: Readonly['<inferred>']
    activeItemStatus: Readonly['<inferred>']
    activeWarnings: '<inferred>'
    attachment: Readonly[RefAttachment[HTMLFormElement]]
    collection: Readonly['<inferred>']
    controlled: Readonly['<inferred>']
    current: Readonly['<inferred>']
    currentIndex: Readonly['<inferred>']
    domVersion: '<inferred>'
    first: Readonly['<inferred>']
    last: Readonly['<inferred>']
    logicalItems: Readonly['<inferred>']
    nativeValidation: Readonly['<inferred>']
    opts: Readonly[QuestionnaireRootStateOpts]
    orderedRegistrations: Readonly['<inferred>']
    pendingFocus: PendingFocus | null
    previousActiveItemName: string | null | undefined
    props: Readonly['<inferred>']
    registrations: '<inferred>'
    rootElement: Readonly['<inferred>']
    runtimeItemByName: Readonly['<inferred>']
    runtimeItems: Readonly['<inferred>']
    shortcuts: Readonly['<inferred>']
    total: Readonly['<inferred>']
    uncontrolledItem: '<inferred>'
    viewState: Readonly['<inferred>']
    def __init__(self, opts: QuestionnaireRootStateOpts): ...
    def confirmCurrent(self) -> '<inferred>': ...
    @staticmethod
    def create(opts: QuestionnaireRootStateOpts) -> '<inferred>': ...
    @staticmethod
    def get() -> '<inferred>': ...
    def goNext(self) -> '<inferred>': ...
    def goPrevious(self) -> '<inferred>': ...
    def handleKeyDown(self, event: KeyboardEvent) -> '<inferred>': ...
    def handleReset(self, event: BitsEvent[Event, HTMLFormElement]) -> '<inferred>': ...
    def handleSubmit(self, event: BitsEvent[SubmitEvent, HTMLFormElement]) -> '<inferred>': ...
    def registerItem(self, registration: ItemRegistration) -> '<inferred>': ...
    def setItem(
        self,
        nextItem: string,
        focusTarget: PendingFocus["target"] = ...,
    ) -> '<inferred>': ...
    def skipCurrent(self) -> '<inferred>': ...

def action(name: '"next" | "previous" | "skip" | "submit"') -> '<inferred>': ...
def actionsMarkup() -> '<inferred>': ...
def boolToEmptyStrOrUndef(condition: boolean) -> '"" | undefined': ...
def boolToTrueOrUndef(condition: boolean) -> true | undefined: ...
def choice(testId: string) -> '<inferred>': ...
def choiceInput(testId: string) -> '<inferred>': ...
def choose(testId: string) -> '<inferred>': ...
def click(element: HTMLElement) -> '<inferred>': ...
async def closeQuestionnaireSsrVite() -> '<inferred>': ...
def compareDocumentOrder['T extends { element: Element }'](first: T, second: T) -> '<inferred>': ...

@overload
def createId(uid: string) -> string: ...
@overload
def createId(prefix: string, uid: string) -> string: ...

def createModel(scenario=...) -> '<inferred>': ...

def createQuestionnaireCollection(
    items: 'readonly QuestionnaireItemDefinition[] | undefined',
) -> QuestionnaireCollection | null: ...

def error(testId: string) -> '<inferred>': ...
async def flushEffects() -> '<inferred>': ...
def form() -> '<inferred>': ...
def freeform(testId: string) -> '<inferred>': ...
def getAnswerKeyShortcuts(shortcut: string | null, filled: boolean) -> '<inferred>': ...

def getCollectionDefinitionWarnings(
    collection: QuestionnaireCollection,
    defaultItem: string | undefined,
) -> '<inferred>': ...

def getCollectionRegistrationWarnings(
    collection: QuestionnaireCollection,
    registrations: 'readonly ItemRegistration[]',
    shortcuts: QuestionnaireShortcutMode | null,
) -> '<inferred>': ...

def getContentBlockPadding(spacer: HTMLElement | null) -> '<inferred>': ...

def getContentBottom(
    __0: '{ content: HTMLElement; spacer: HTMLElement | null; viewport: HTMLElement }',
) -> '<inferred>': ...

def getElementScrollTop(
    __0: '<{ align: MessageScrollerScrollAlign; element: HTMLElement; … (132 chars, #b5b21c9a)>',
) -> '<inferred>': ...

def getElementTop(element: HTMLElement, viewport: HTMLElement) -> '<inferred>': ...
def getElementViewportTop(element: HTMLElement, viewport: HTMLElement) -> '<inferred>': ...

def getFirstVisibleMessageItem(
    __0: '{ content: HTMLElement; spacer: HTMLElement | null; viewport: HTMLElement }',
) -> '<inferred>': ...

def getFlexGap(element: HTMLElement | null) -> '<inferred>': ...

def getInitialItemName(
    collection: QuestionnaireCollection | null,
    defaultItem: string | undefined,
) -> '<inferred>': ...

def getLastScrollAnchor(items: 'HTMLElement[]') -> '<inferred>': ...
def getMaxScrollTop(viewport: HTMLElement) -> '<inferred>': ...
def getMessageScrollerItems(content: HTMLElement, spacer: HTMLElement | null) -> '<inferred>': ...

def getMessageScrollerScrollable(
    __0: '{ content: HTMLElement | null; scrollEdgeThreshold: number; spacer: HTMLElement | null; viewport: HTMLElement | null }',
) -> MessageScrollerScrollable: ...

def getMessageScrollerVisibilityState(
    __0: '<{ content: HTMLElement | null; scrollMargin: number; … (175 chars, #ccb4ace7)>',
) -> MessageScrollerVisibilityState: ...

def getNavigationProps(
    opts: '<{ disabled: boolean; onClick?: QuestionnaireNextProps["oncli … (211 chars, #1a546978)>',
) -> '<inferred>': ...

def getNavigationState(
    opts: '{ disabled: boolean; shortcut?: "Enter"; status: QuestionnaireItemStatus | null; visible: boolean }',
) -> QuestionnaireNavigationState: ...

def getNewScrollAnchor(items: 'HTMLElement[]', previousItemCount: number) -> '<inferred>': ...

def getShortcutByChoiceValue(
    item: QuestionnaireItemDefinition | undefined,
    shortcuts: QuestionnaireShortcutMode | null,
) -> '<inferred>': ...

def getShortcutFromKey(key: string, shortcuts: QuestionnaireShortcutMode) -> '<inferred>': ...
def getShortcutKeys(shortcuts: QuestionnaireShortcutMode | null) -> '<inferred>': ...

def getTailSpacerHeight(
    __0: '{ content: HTMLElement; scrollTop: number; spacer: HTMLElement | null; viewport: HTMLElement }',
) -> '<inferred>': ...

def getUnanchoredScrollAnchor(
    items: 'HTMLElement[]',
    handledAnchors: '{ has(element: HTMLElement): boolean }',
) -> '<inferred>': ...

def hasInputValue(value: unknown) -> '<inferred>': ...

def hasMultipleNewScrollAnchors(
    items: 'HTMLElement[]',
    previousItemCount: number,
) -> '<inferred>': ...

def isAnswerFilled(answer: AnswerControlRegistration) -> '<inferred>': ...
def isEmptyNavigableInput(answer: AnswerControlRegistration | null) -> '<inferred>': ...
def isRadioTarget(element: Element) -> '<inferred>': ...
def isTextEntryTarget(element: Element) -> '<inferred>': ...
def item(value: string) -> '<inferred>': ...

def keydown(
    element: HTMLElement,
    key: string,
    options: KeyboardEventInit = ...,
) -> '<inferred>': ...

def next() -> '<inferred>': ...
def previous() -> '<inferred>': ...
def progress() -> '<inferred>': ...

def renderCase(
    scenario=...,
    setup: '(next: QuestionnaireTestModel) => void' = ...,
) -> '<inferred>': ...

async def renderQuestionnaireToString(model: QuestionnaireTestModel) -> '<inferred>': ...
def requiredElement['T extends Element = HTMLElement'](selector: string) -> '<inferred>': ...
def setContainer(next: HTMLDivElement) -> '<inferred>': ...
def shortcut(value: string) -> '<inferred>': ...
def skip() -> '<inferred>': ...
def ssrChoice(value: string) -> '<inferred>': ...
def ssrChoiceInput(value: string) -> '<inferred>': ...
def submit() -> '<inferred>': ...
def type(element: HTMLInputElement, value: string) -> '<inferred>': ...
def unmountApp() -> '<inferred>': ...
def useMessageScroller() -> '<inferred>': ...
def useMessageScrollerScrollable() -> MessageScrollerScrollable: ...
def useMessageScrollerVisibility() -> MessageScrollerVisibilityState: ...

def useVirtualizer['TScrollElement extends Element', 'TItemElement extends Element'](
    options: '<PartialKeys[VirtualizerOptions[TScrollElement, … (123 chars, #1939f915)>',
) -> SvelteVirtualizer[TScrollElement, TItemElement]: ...

def useWindowVirtualizer['TItemElement extends Element'](
    options: '<PartialKeys[VirtualizerOptions[Window, TItemElement], … (136 chars, #4653d1b6)>',
) -> SvelteVirtualizer[Window, TItemElement]: ...

AUTOSCROLLING_CLEAR_DELAY: '<inferred>'
config: '<inferred>'
container: HTMLDivElement
DEFAULT_SCROLL_EDGE_THRESHOLD: '<inferred>'
DEFAULT_SCROLL_MARGIN: '<inferred>'
DEFAULT_SCROLL_PREVIOUS_ITEM_PEEK: '<inferred>'
EMPTY_MESSAGE_SCROLLER_SCROLLABLE: MessageScrollerScrollable
EMPTY_MESSAGE_SCROLLER_VISIBILITY_STATE: MessageScrollerVisibilityState
EMPTY_VISIBLE_MESSAGE_IDS: 'string[]'
model: QuestionnaireTestModel
SCROLL_POSITION_EPSILON: '<inferred>'
ssrItems: '<inferred>'
USER_SCROLL_KEYS: '<inferred>'
vite_config: '<inferred>'
vitest_browser_config: '<inferred>'
vitest_config: '<inferred>'
