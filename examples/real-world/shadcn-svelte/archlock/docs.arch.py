__module__ = "docs"
__paths__ = ["docs/**"]
__depends_on__ = ["docs.blocks", "docs.ui", "parity", "shadcn_svelte"]

from .shadcn_svelte import iconLibraries, IconLibrary, IconLibraryName

BaseColorName: TypeAlias = BaseTheme["name"]
BaseTheme: TypeAlias = '(typeof BASE_THEMES)[number]'
BiasFilter: TypeAlias[T] = '(items: readonly T[], context: RandomizeContext) => readonly T[]'
Block: TypeAlias = 'z.infer[typeof blockSchema]'
ChangelogPage: TypeAlias = '{ href: string; slug: string; metadata: ChangelogMetadata; component: Component | null; date: Date | null }'
Colors: TypeAlias = '<{ inherit: string; current: string; transparent: string; … (574 chars, #b984bc9e)>'
ColorScale: TypeAlias = '{ scale: number; hex: string; rgb: string; hsl: string; oklch: string }'
CompleteColorFormat: TypeAlias = '{ hex: string; rgb: string; hsl: string; oklch: string }'
DashboardTableFeatures: TypeAlias = 'typeof features'
FileMap: TypeAlias = Record[string, string]
FileNode: TypeAlias = '{ type: "file"; name: string; path: string } | { type: "folder"; name: string; path: string; children: FileNode[] }'
FileTree: TypeAlias = '{ name: string; path?: string; children?: FileTree[] }'
Font: TypeAlias = '(typeof FONTS)[number]'
FontDefinition: TypeAlias = '<{ name: string; title: string; type: "sans" | "mono" | … (283 chars, #cd1b65ac)>'
FontHeadingOption: TypeAlias = '(typeof FONT_HEADING_OPTIONS)[number]'
FontHeadingValue: TypeAlias = 'FontValue | "inherit"'
FontName: TypeAlias = '(typeof FONT_DEFINITIONS)[number]["name"]'
FontValue: TypeAlias = '(typeof PRESET_FONTS)[number]'
HighlightedLine: TypeAlias = 'string | HighlightedToken[]'
HighlightedToken: TypeAlias = '{ content: string; style?: string; class?: string }'
Highlighter: TypeAlias = 'NonNullable[Awaited[ReturnType[typeof loadHighlighter]]]'
HugeIconsIconName: TypeAlias = '<"ActivityIcon" | "Add01Icon" | "AddToListIcon" | … (3382 chars, #667c6624)>'
IconLoader: TypeAlias = '{ (icon: string): Promise[Component | null]; peek: (icon: string) => Component | null | undefined }'
InstallationType: TypeAlias = 'z.infer[typeof installationTypeSchema]'
Layout: TypeAlias = 'z.infer[typeof layoutSchema]'
Lockable: TypeAlias = '<{ style: boolean; baseColor: boolean; theme: boolean; … (226 chars, #77b2f701)>'
LucideIconName: TypeAlias = '<"ActivityIcon" | "AlertCircleIcon" | "AlertTriangleIcon" | … (2910 chars, #549ea3ac)>'
MenuAccent: TypeAlias = '(typeof MENU_ACCENTS)[number]'
MenuAccentValue: TypeAlias = MenuAccent["value"]
MenuColor: TypeAlias = '(typeof MENU_COLORS)[number]'
MenuColorValue: TypeAlias = MenuColor["value"]
MessageAnimationId: TypeAlias = 'keyof typeof MESSAGE_ANIMATIONS'
MessageAnimationPreset: TypeAlias = '(typeof MESSAGE_ANIMATIONS)[MessageAnimationId]'
Model: TypeAlias['Type = string'] = '{ id: string; name: string; description: string; strengths?: string; type: Type }'
ModelType: TypeAlias = '(typeof types)[number]'
NavItem: TypeAlias = '{ title: string; href?: string; disabled?: boolean; external?: boolean; label?: string; icon?: Component }'
NavItemWithChildren: TypeAlias = 'NavItem & { items: NavItemWithChildren[] }'
PackageManagerCommand: TypeAlias = 'Command | "create"'
Payment: TypeAlias = '{ id: string; amount: number; status: "pending" | "processing" | "success" | "failed"; email: string }'
PaymentsTableFeatures: TypeAlias = 'typeof features'
PhosphorIconName: TypeAlias = '<"AppWindowIcon" | "ArchiveIcon" | "ArrowCircleLeftIcon" | … (2668 chars, #0b3e3c24)>'
Radius: TypeAlias = '(typeof RADII)[number]'
RadiusValue: TypeAlias = Radius["name"]
RandomizeBiases: TypeAlias = '<{ baseColors?: BiasFilter[BaseColor]; chartColors?: … (144 chars, #a26666fb)>'
RandomizeContext: TypeAlias = '<{ style?: StyleName; baseColor?: BaseColorName; theme?: … (183 chars, #3ed3de7b)>'
RemixIconIconName: TypeAlias = '<"RiAddBoxLine" | "RiAddCircleLine" | "RiAddLine" | … (2846 chars, #416c6080)>'
Schema: TypeAlias = 'z.infer[typeof schema]'
SearchContent: TypeAlias = '<{ title: string; content: string; description: string; … (141 chars, #e3ba17c1)>'
SearchEntry: TypeAlias = '<{ title: string; description: string; content: string; … (141 chars, #b95eccc7)>'
SearchResult: TypeAlias = 'SearchContent & { snippet?: string; highlights?: string[] }'
SidebarNavItem: TypeAlias = 'NavItem & { items: SidebarNavItem[] }'
src_lib_blocks__BlockName: TypeAlias = '(typeof blocks)[number]'
src_lib_colors__Color: TypeAlias = 'ReturnType[typeof getColors][number]["colors"][number]'
src_lib_colors__ColorPalette: TypeAlias = 'z.infer[typeof colorPaletteSchema]'
src_lib_components_colors_colors__Color: TypeAlias = 'ReturnType[typeof getColors][number]["colors"][number]'
src_lib_components_colors_colors__ColorFormat: TypeAlias = 'keyof ReturnType[typeof getColorFormat]'
src_lib_components_colors_colors__ColorPalette: TypeAlias = 'z.infer[typeof colorPaletteSchema]'
src_lib_package_manager__PackageManager: TypeAlias = '(typeof PACKAGE_MANAGERS)[number]'
src_lib_registry_base_colors__BaseColor: TypeAlias = '(typeof BASE_COLORS)[number]'
src_lib_registry_colors__BaseColor: TypeAlias = '(typeof baseColors)[number]'
src_lib_registry_config__DesignSystemConfig: TypeAlias = 'z.infer[typeof designSystemConfigSchema]'
src_lib_registry_config__Preset: TypeAlias = '{ name: string; title: string; description: string } & DesignSystemConfig'
src_lib_registry_lib_utils__WithElementRef: TypeAlias[T, 'U extends HTMLElement = HTMLElement'] = 'T & { ref?: U | null }'
src_lib_registry_lib_utils__WithoutChild: TypeAlias[T] = 'T extends { child?: any } ? Omit[T, "child"] : T'
src_lib_registry_lib_utils__WithoutChildren: TypeAlias[T] = 'T extends { children?: any } ? Omit[T, "children"] : T'
src_lib_registry_lib_utils__WithoutChildrenOrChild: TypeAlias[T] = WithoutChildren[WithoutChild[T]]
src_lib_registry_registry_base_colors__BaseColor: TypeAlias = '(typeof baseColors)[number]'
src_lib_registry_registry_colors__BaseColor: TypeAlias = '(typeof baseColors)[number]'
src_lib_registry_registry_utils__DesignSystemConfig: TypeAlias = '{ style: StyleName; iconLibrary: IconLibraryName; menuColor?: MenuColorValue }'
src_lib_registry_schema__BlockName: TypeAlias = '(typeof blockNames)[number]'
src_lib_registry_themes__Theme: TypeAlias = '(typeof THEMES)[number]'
src_lib_themes__Theme: TypeAlias = '(typeof THEMES)[number]'
src_lib_user_config_svelte__ActiveTheme: TypeAlias = 'z.infer[typeof activeTheme]'
src_lib_user_config_svelte__ColorFormat: TypeAlias = 'z.infer[typeof colorFormatSchema]'
src_lib_user_config_svelte__PackageManager: TypeAlias = 'z.infer[typeof packageManagerSchema]'
src_lib_utils__WithElementRef: TypeAlias[T, 'U extends HTMLElement = HTMLElement'] = 'T & { ref?: U | null }'
src_lib_utils__WithoutChild: TypeAlias[T] = 'T extends { child?: any } ? Omit[T, "child"] : T'
src_lib_utils__WithoutChildren: TypeAlias[T] = 'T extends { children?: any } ? Omit[T, "children"] : T'
src_lib_utils__WithoutChildrenOrChild: TypeAlias[T] = WithoutChildren[WithoutChild[T]]
src_routes__app___layout__examples_playground__data__presets__Preset: TypeAlias = '{ id: string; name: string }'
Style: TypeAlias = '(typeof STYLES)[number]'
StyleName: TypeAlias = Style["name"]
TableOfContents: TypeAlias = '{ items?: TocItem[] }'
TablerIconName: TypeAlias = '<"IconActivity" | "IconAlertCircle" | "IconAlertOctagon" | … (2846 chars, #5d422cd3)>'
Task: TypeAlias = 'z.output[typeof taskSchema]'
TasksTableFeatures: TypeAlias = 'typeof features'
ThemeName: TypeAlias = Theme["name"]
TocItem: TypeAlias = '{ title: string; url: string; items?: TocItem[] }'
UserConfigType: TypeAlias = 'z.infer[typeof userConfigSchema]'

class BaseColorOKLCH(Protocol):
    dark: Record[string, string]
    light: Record[string, string]

class HighlightedBlock(Protocol):
    description: Opt[string]
    files: 'HighlightedFile[]'
    meta: Opt[Record[string, unknown]]
    name: string
    type: string

class HighlightedFile(Protocol):
    highlightedContent: string
    target: string
    type: '<"registry:file" | "registry:page" | "registry:ui" | … (145 chars, #10e290cc)>'

class IDesignSystemState(PresetConfig, Protocol):
    canRedo: boolean
    canUndo: boolean
    chartColor: ChartColorName
    lock: '(key: keyof Lockable) => void'
    locks: Lockable
    preset: string
    randomize: '() => void'
    redo: '() => void'
    reset: '() => void'
    shareUrl: string
    undo: '() => void'
    unlock: '(key: keyof Lockable) => void'

class src_lib_components_theme_customizer__BaseColor(Protocol):
    activeColor: '{ light: string; dark: string }'
    cssVars: '{ light: Record[string, string]; dark: Record[string, string] }'
    label: string
    name: string

class A(SvelteComponent, HTMLAnchorAttributes): ...

class ActionMenu(SvelteComponent):
    children: Snippet

class ActionMenuContext:
    open: '<inferred>'

class ActivityGoal(SvelteComponent): ...
class Announcement(SvelteComponent): ...
class AppearanceSettings(SvelteComponent): ...
class AppSidebar(SvelteComponent, 'ComponentProps[typeof Sidebar.Root]'): ...

class BaseColorPicker(SvelteComponent):
    submenu: Opt[boolean]

class Bash(SvelteComponent, SVGAttributes[SVGSVGElement]): ...
class Blockquote(SvelteComponent, HTMLAttributes[HTMLElement]): ...
class BlocksNav(SvelteComponent): ...

class BlockViewer(SvelteComponent, Pick[BlockViewerContextType, "item" | "tree"]):
    children: Opt[Snippet]

class BlockViewerCode(SvelteComponent): ...
class BlockViewerCopyCodeButton(SvelteComponent): ...
class BlockViewerFileTree(SvelteComponent): ...

class BlockViewerIframe(SvelteComponent):
    self["class"]: Opt[string]

class BlockViewerToolbar(SvelteComponent): ...

class BlockViewerTree(SvelteComponent):
    index: number
    item: FileTree

class BlockViewerView(SvelteComponent): ...

class BlockViewerViewMobile(SvelteComponent):
    children: Opt[Snippet]

class Blueprint(SvelteComponent):
    component: string
    description: string
    source: string
    title: string

class Calendar(SvelteComponent): ...

class Callout(SvelteComponent, 'Omit[ComponentProps[typeof Alert.Root], "variant"]'):
    icon: Opt[Component]
    variant: Opt['"default" | "info" | "warning"']

class ChartAreaInteractive(SvelteComponent): ...

class ChartCodeViewer(SvelteComponent, HTMLAttributes[HTMLDivElement]):
    chart: HighlightedBlock
    code: string

class ChartColorPicker(SvelteComponent):
    submenu: Opt[boolean]

class ChartCopyButton(SvelteComponent, 'ComponentProps[typeof Button]'):
    code: string

class ChartDisplay(SvelteComponent, HTMLAttributes[HTMLDivElement]):
    chartData: 'HighlightedBlock[]'
    name: string

class ChartsNav(SvelteComponent, HTMLAttributes[HTMLElement]): ...

class ChartToolbar(SvelteComponent, HTMLAttributes[HTMLDivElement]):
    chart: HighlightedBlock

class ChartTooltipDemoItem(SvelteComponent, WithoutChildren[WithElementRef[HTMLAttributes[HTMLDivElement]]]):
    formatter: Opt['Snippet[[{ value: unknown; name: string; item: TooltipPayload; index: number; payload: TooltipPayload[] }]]']
    hideIndicator: Opt[boolean]
    hideLabel: Opt[boolean]
    indicator: Opt['"line" | "dot" | "dashed"']
    label: Opt[string]
    labelClassName: Opt[string]
    nameKey: Opt[string]
    payload: '{ name: string; value: number; color: string }[]'

class Chat(SvelteComponent): ...
class CodeCollapsibleWrapper(SvelteComponent, 'ComponentProps[typeof Collapsible.Root]'): ...
class CodeTabs(SvelteComponent, 'ComponentProps[typeof Tabs.Root]'): ...
class CodeViewer(SvelteComponent): ...
class ColorCard(SvelteComponent): ...

class ColorFormatSelector(SvelteComponent, 'Omit[ComponentProps[typeof Select.Trigger], "color"]'):
    color: Color

class ColorIndicator(SvelteComponent):
    color: string

class ColorsNav(SvelteComponent, HTMLAttributes[HTMLElement]): ...

class CommandMenu(SvelteComponent):
    blocks: Opt['{ name: string; description: string; categories: string[] }[]']
    closeMobileMenu: Opt['() => void']
    colors: 'ColorPalette[]'

class CommandMenuItem(SvelteComponent, 'ComponentProps[typeof Command.Item]'): ...

class CommandsMenu(SvelteComponent):
    userMessages: 'UIMessage[]'

class ComponentCodeViewer(SvelteComponent, Pick[ComponentCodeViewerContextType, "item" | "allowSidebar"]): ...
class ComponentCodeViewerCode(SvelteComponent): ...
class ComponentCodeViewerCodeTitle(SvelteComponent): ...
class ComponentCodeViewerCopyCodeButton(SvelteComponent, 'ComponentProps[typeof Button]'): ...
class ComponentCodeViewerFileTree(SvelteComponent): ...

class ComponentCodeViewerTree(SvelteComponent):
    index: number
    item: FileTree

class ComponentPreview(SvelteComponent, HTMLAttributes[HTMLElement]):
    align: Opt['"center" | "start" | "end"']
    component: Opt[Component]
    description: Opt[string]
    hideCode: Opt[boolean]
    name: string
    previewClassName: Opt[string]
    previewStyle: Opt[PresetConfig["style"]]
    type: Opt['"block" | "component" | "example"']

class ComponentPreviewTabs(SvelteComponent, HTMLAttributes[HTMLElement]):
    align: Opt['"center" | "start" | "end"']
    chromeLessOnMobile: Opt[boolean]
    component: Opt[Component]
    example: Opt[Snippet]
    hideCode: Opt[boolean]
    name: string
    previewClassName: Opt[string]
    previewStyle: Opt[PresetConfig["style"]]

class ComponentsList(SvelteComponent):
    variant: Opt['"all" | "new"']

class ComponentSource(SvelteComponent, Pick[ComponentCodeViewerContextType, "item" | "allowSidebar"]): ...
class CookieSettings(SvelteComponent): ...

class CopyButton(SvelteComponent, 'ComponentProps[typeof Button]'):
    text: string

class CopyPreset(SvelteComponent):
    self["class"]: Opt[string]

class CreateAccount(SvelteComponent): ...
class Css(SvelteComponent, SVGAttributes[SVGSVGElement]): ...
class Cta(SvelteComponent): ...
class CtaMobile(SvelteComponent): ...
class Customizer(SvelteComponent): ...

class CustomizerControls(SvelteComponent):
    self["class"]: Opt[string]
    submenu: Opt[boolean]

class DataTableActions(SvelteComponent): ...
class DataTableCell(SvelteComponent, HTMLAttributes[HTMLDivElement]): ...

class DataTableCellViewer(SvelteComponent):
    item: Schema

class DataTableCheckbox(SvelteComponent, 'ComponentProps[typeof Checkbox]'): ...

class DataTableColumnHeader['TData extends RowData', TValue](SvelteComponent, HTMLAttributes[HTMLDivElement]):
    column: Column[TasksTableFeatures, TData, TValue]
    title: string

class DataTableDragHandle(SvelteComponent):
    attach: Opt[Attachment]

class DataTableFacetedFilter['TData extends RowData', TValue](SvelteComponent):
    column: Column[TasksTableFeatures, TData, TValue]
    options: '{ label: string; value: string; icon?: Component }[]'
    title: string

class DataTableHeaderLimit(SvelteComponent): ...
class DataTableHeaderTarget(SvelteComponent): ...

class DataTableLimit(SvelteComponent):
    row: Row[DashboardTableFeatures, Schema]

class DataTablePriorityCell(SvelteComponent):
    value: string

class DataTableReviewer(SvelteComponent):
    row: Row[DashboardTableFeatures, Schema]

class DataTableRowActions(SvelteComponent):
    row: Row[TasksTableFeatures, Task]

class DataTableStatus(SvelteComponent):
    row: Row[DashboardTableFeatures, Schema]

class DataTableStatusCell(SvelteComponent):
    value: string

class DataTableTarget(SvelteComponent):
    row: Row[DashboardTableFeatures, Schema]

class DataTableTitleCell(SvelteComponent):
    labelValue: string
    value: string

class DataTableToolbar['TData extends RowData'](SvelteComponent):
    table: SvelteTable[TasksTableFeatures, TData]

class DataTableType(SvelteComponent):
    row: Row[DashboardTableFeatures, Schema]

class DataTableViewOptions['TData extends RowData'](SvelteComponent):
    table: SvelteTable[TasksTableFeatures, TData]

class Demo(SvelteComponent): ...

class DesignSystemProvider(SvelteComponent):
    children: Snippet

class DesignSystemState(IDesignSystemState):
    baseColor: PresetConfig["baseColor"]
    canRedo: Readonly['<inferred>']
    canUndo: Readonly['<inferred>']
    chartColor: ChartColorName
    font: PresetConfig["font"]
    fontHeading: PresetConfig["fontHeading"]
    iconLibrary: PresetConfig["iconLibrary"]
    locks: Readonly[Lockable]
    menuAccent: PresetConfig["menuAccent"]
    menuColor: PresetConfig["menuColor"]
    preset: string
    radius: PresetConfig["radius"]
    shareUrl: Readonly['<inferred>']
    style: PresetConfig["style"]
    theme: PresetConfig["theme"]
    def __init__(self): ...
    def lock(self, key: 'keyof Lockable') -> void: ...
    def randomize(self) -> '<inferred>': ...
    def redo(self) -> '<inferred>': ...
    def reset(self) -> '<inferred>': ...
    def undo(self) -> '<inferred>': ...
    def unlock(self, key: 'keyof Lockable') -> void: ...

class DocsCopyPage(SvelteComponent): ...

class DocsFigure(SvelteComponent):
    caption: Opt[string]
    children: Opt[Snippet]

class DocsSidebar(SvelteComponent, 'ComponentProps[typeof Sidebar.Root]'):
    navItems: 'SidebarNavItem[]'

class DocsToc(SvelteComponent):
    self["class"]: Opt[string]
    toc: TableOfContents
    variant: Opt['"dropdown" | "list"']

class DocTabs(SvelteComponent, 'ComponentProps[typeof Tabs.Root]'): ...
class DocTabsContent(SvelteComponent, 'ComponentProps[typeof Tabs.Content]'): ...
class DocTabsList(SvelteComponent, 'ComponentProps[typeof Tabs.List]'): ...
class DocTabsTrigger(SvelteComponent, 'ComponentProps[typeof Tabs.Trigger]'): ...
class Ethical(SvelteComponent): ...

class Example(SvelteComponent, HTMLAttributes[HTMLDivElement]):
    containerClass: Opt[string]
    title: Opt[string]

class ExamplesNav(SvelteComponent, HTMLAttributes[HTMLElement]): ...
class ExampleWrapper(SvelteComponent, HTMLAttributes[HTMLDivElement]): ...
class ExerciseMinutes(SvelteComponent): ...
class FieldCheckbox(SvelteComponent): ...
class FieldHear(SvelteComponent): ...
class Figcaption(SvelteComponent, HTMLAttributes[HTMLElement]): ...

class FileTreeNode(SvelteComponent):
    node: FileNode
    onSelect: '(path: string) => void'
    selected: string

class FontPicker(SvelteComponent):
    fonts: 'readonly FontPickerOption[]'
    label: string
    param: '"font" | "fontHeading"'
    submenu: Opt[boolean]

class Forms(SvelteComponent): ...
class Github(SvelteComponent, SVGAttributes[SVGElement]): ...
class GithubLink(SvelteComponent): ...
class H1(SvelteComponent, HTMLAttributes[HTMLHeadingElement]): ...
class H2(SvelteComponent, HTMLAttributes[HTMLHeadingElement]): ...
class H3(SvelteComponent, HTMLAttributes[HTMLHeadingElement]): ...
class H4(SvelteComponent, HTMLAttributes[HTMLHeadingElement]): ...
class H5(SvelteComponent, HTMLAttributes[HTMLHeadingElement]): ...
class H6(SvelteComponent, HTMLAttributes[HTMLHeadingElement]): ...

class HeadingAnchor(SvelteComponent):
    children: Opt[Snippet]
    id: Opt[string]

class Hr(SvelteComponent, HTMLAttributes[HTMLElement]): ...
class Hugeicons(SvelteComponent, SVGAttributes[SVGSVGElement]): ...

class HugeiconsIcon(SvelteComponent, 'Omit[ComponentProps[typeof HugeiconsIcon], "icon"]'):
    self["data-slot"]: Opt[string]
    icon: HugeIconsIconName
    placeholder: Snippet

class IconLibraryPicker(SvelteComponent):
    submenu: Opt[boolean]

class IconPlaceholder(SvelteComponent, Omit[SvgProps, "class"]):
    self["class"]: Opt[string]
    hugeicons: HugeIconsIconName
    lucide: LucideIconName
    phosphor: PhosphorIconName
    remixicon: RemixIconIconName
    tabler: TablerIconName

class Img(SvelteComponent, HTMLImgAttributes): ...

class InitializeDialog(SvelteComponent):
    children: Snippet

class InitializeProjectContext:
    open: '<inferred>'

class InputDemo(SvelteComponent): ...
class InputGroupButtonDemo(SvelteComponent): ...
class InstallCards(SvelteComponent): ...

class InstallTabs(SvelteComponent):
    cli: Snippet
    manual: Snippet

class IsMobile(MediaQuery):
    def __init__(self, breakpoint: number = ...): ...

class ItemDemo(SvelteComponent): ...

class ItemExplorer(SvelteComponent):
    items: 'Pick[RegistryItem, "name" | "title" | "type"][]'

class Json(SvelteComponent, SVGAttributes[SVGSVGElement]): ...
class LayoutToggle(SvelteComponent, 'ComponentProps[typeof Button]'): ...
class Li(SvelteComponent, HTMLAttributes[HTMLLIElement]): ...
class LinkedCard(SvelteComponent, HTMLAnchorAttributes): ...

class LockButton(SvelteComponent):
    self["class"]: Opt[string]
    prop: 'keyof Lockable'

class Logo(SvelteComponent, SVGAttributes[SVGElement]): ...
class Lucide(SvelteComponent, SVGAttributes[SVGSVGElement]): ...

class LucideIcon(SvelteComponent, SVGAttributes[SVGSVGElement]):
    icon: LucideIconName
    placeholder: Snippet

class Luma(SvelteComponent, SVGAttributes[SVGSVGElement]): ...
class Lyra(SvelteComponent, SVGAttributes[SVGSVGElement]): ...
class Maia(SvelteComponent, SVGAttributes[SVGSVGElement]): ...

class MainMenu(SvelteComponent):
    self["class"]: Opt[string]

class MainNav(SvelteComponent, HTMLAttributes[HTMLElement]):
    self["class"]: Opt[string]
    items: 'NavItem[]'

class Markdown(SvelteComponent, StreamdownProps): ...
class MaxLengthSelector(SvelteComponent, SliderPrimitive.RootProps): ...

class MenuAccentPicker(SvelteComponent):
    submenu: Opt[boolean]

class MenuColorPicker(SvelteComponent):
    submenu: Opt[boolean]

class MenuIconDefault(SvelteComponent, SVGAttributes[SVGSVGElement]): ...
class MenuIconInverted(SvelteComponent, SVGAttributes[SVGSVGElement]): ...

class MessageAnimated(SvelteComponent):
    animationPreset: Opt[MessageAnimationPreset]
    assistantVariant: Opt[BubbleVariant]
    self["class"]: Opt[string]
    message: MessageAnimatedMessage
    scrollAnchor: Opt[boolean]
    userVariant: Opt[BubbleVariant]

class Metadata(SvelteComponent):
    description: Opt[string]
    keywords: Opt['string[]']
    ogImage: Opt['Partial[(typeof siteConfig)["ogImage"]]']
    ogType: Opt[string]
    title: Opt[string]

class Mira(SvelteComponent, SVGAttributes[SVGSVGElement]): ...
class MobileNav(SvelteComponent, ButtonProps): ...

class ModelItem(SvelteComponent, CommandPrimitive.ItemProps):
    isSelected: boolean
    model: Model
    onPeek: '(model: Model) => void'
    onSelect: '() => void'

class ModelSelector(SvelteComponent):
    models: 'Model[]'
    types: 'ModelType[]'

class ModeSwitcher(SvelteComponent):
    self["class"]: Opt[string]

class NavDocuments(SvelteComponent):
    items: '{ name: string; url: string; icon?: Icon }[]'

class NavMain(SvelteComponent):
    items: '{ title: string; url: string; icon?: Icon }[]'

class NavSecondary(SvelteComponent, 'ComponentProps[typeof Sidebar.Group]'):
    items: '{ title: string; url: string; icon: Icon }[]'

class NavUser(SvelteComponent):
    user: '{ name: string; email: string; avatar: string }'

class Nested(SvelteComponent): ...
class NotionPromptForm(SvelteComponent): ...
class Nova(SvelteComponent, SVGAttributes[SVGSVGElement]): ...

class Og(SvelteComponent):
    description: Opt[string | null]
    title: Opt[string | null]

class Ol(SvelteComponent, HTMLAttributes[HTMLOListElement]): ...

class OpeningPositionScroller(SvelteComponent):
    position: '"start" | "end" | "last-anchor"'
    positionKey: number

class OpenPreset(SvelteComponent):
    self["class"]: Opt[string]
    label: Opt[string]

class P(SvelteComponent, HTMLAttributes[HTMLParagraphElement]): ...
class PageActions(SvelteComponent, HTMLAttributes[HTMLElement]): ...
class PageHeader(SvelteComponent, HTMLAttributes[HTMLElement]): ...
class PageHeaderDescription(SvelteComponent, HTMLAttributes[HTMLElement]): ...
class PageHeaderHeading(SvelteComponent, HTMLAttributes[HTMLElement]): ...
class PageNav(SvelteComponent, HTMLAttributes[HTMLElement]): ...

class PaymentsActionsCell(SvelteComponent):
    row: Row[PaymentsTableFeatures, Payment]

class PaymentsEmailHeader(SvelteComponent):
    column: Column[PaymentsTableFeatures, Payment, string]

class Phosphor(SvelteComponent, SVGAttributes[SVGSVGElement]): ...

class PhosphorIcon(SvelteComponent, SVGAttributes[SVGSVGElement]):
    icon: PhosphorIconName
    placeholder: Snippet

class Picker(SvelteComponent, '({ submenu: true } & DropdownMenuPrimitive.RootProps) | ({ submenu: false } & DropdownMenuPrimitive.SubProps)'): ...

class PickerCheckboxItem(SvelteComponent, WithoutChildrenOrChild[DropdownMenuPrimitive.CheckboxItemProps]):
    children: Opt[Snippet]

class PickerContent(SvelteComponent, DropdownMenuPrimitive.ContentProps):
    portalProps: Opt[WithoutChildrenOrChild[DropdownMenuPrimitive.PortalProps]]
    submenu: Opt[boolean]

class PickerGroup(SvelteComponent, DropdownMenuPrimitive.GroupProps): ...

class PickerItem(SvelteComponent, DropdownMenuPrimitive.ItemProps):
    inset: Opt[boolean]
    variant: Opt['"default" | "destructive"']

class PickerLabel(SvelteComponent, DropdownMenuPrimitive.GroupHeadingProps):
    inset: Opt[boolean]

class PickerRadioGroup(SvelteComponent, DropdownMenuPrimitive.RadioGroupProps): ...
class PickerRadioItem(SvelteComponent, WithoutChild[DropdownMenuPrimitive.RadioItemProps]): ...
class PickerSeparator(SvelteComponent, DropdownMenuPrimitive.SeparatorProps): ...
class PickerShortcut(SvelteComponent, WithElementRef[HTMLAttributes[HTMLSpanElement]]): ...

class PickerTrigger(SvelteComponent, DropdownMenuPrimitive.TriggerProps):
    submenu: Opt[boolean]

class PmAddComp(SvelteComponent):
    name: string

class PmBlock(SvelteComponent):
    command: 'string | string[]'
    type: 'Command | "create"'

class PmCreate(SvelteComponent):
    command: string

class PmExecute(SvelteComponent):
    command: string

class PmInstall(SvelteComponent):
    command: string

class PmRemove(SvelteComponent):
    command: string

class PmRun(SvelteComponent):
    command: string

class PmUpgrade(SvelteComponent):
    command: string

class Pre(SvelteComponent, HTMLAttributes[HTMLPreElement]): ...
class PresetActions(SvelteComponent): ...

class PresetPicker(SvelteComponent):
    submenu: Opt[boolean]

class PresetSave(SvelteComponent): ...

class PresetSelector(SvelteComponent):
    presets: 'Preset[]'

class PresetShare(SvelteComponent): ...

class Preview(SvelteComponent):
    item: string

class PreviewSwitcher(SvelteComponent):
    item: string

class RadiusPicker(SvelteComponent):
    submenu: Opt[boolean]

class RandomButton(SvelteComponent):
    submenu: Opt[boolean]

class Remixicon(SvelteComponent, SVGAttributes[SVGSVGElement]): ...

class RemixiconIcon(SvelteComponent, SVGAttributes[SVGSVGElement]):
    icon: RemixIconIconName
    placeholder: Snippet

class ReportIssue(SvelteComponent): ...

class ResetButton(SvelteComponent):
    submenu: Opt[boolean]

class Rhea(SvelteComponent, SVGAttributes[SVGSVGElement]): ...
class RootComponents(SvelteComponent): ...
class ScrollableFooter(SvelteComponent): ...
class SectionCards(SvelteComponent): ...
class Sera(SvelteComponent, SVGAttributes[SVGSVGElement]): ...
class SidebarNav(SvelteComponent): ...

class SidebarSection(SvelteComponent):
    children: Opt[Snippet]
    self["class"]: Opt[string]
    label: string

class SiteFooter(SvelteComponent): ...
class Spinner(SvelteComponent, SVGAttributes[SVGSVGElement]): ...
class src_lib_components_active_theme__ActiveTheme(SvelteComponent): ...
class src_lib_components_cards_cards_demo__CardsDemo(SvelteComponent): ...
class src_lib_components_cards_payments__Payments(SvelteComponent): ...
class src_lib_components_cards_share__Share(SvelteComponent): ...

class src_lib_components_code_block_markdown_code_block__MarkdownCodeBlock(SvelteComponent):
    incomplete: boolean
    token: '{ text: string; lang?: string }'

class src_lib_components_color__Color(SvelteComponent):
    clipboard: UseClipboard
    color: Color

class src_lib_components_color_palette__ColorPalette(SvelteComponent):
    clipboard: UseClipboard
    colorPalette: ColorPalette

class src_lib_components_markdown_markdown_code_block__MarkdownCodeBlock(SvelteComponent):
    incomplete: boolean
    token: '{ text: string; lang?: string }'

class src_lib_components_site_header__SiteHeader(SvelteComponent): ...
class src_routes__app___layout___create__components_share__Share(SvelteComponent): ...
class src_routes__app___layout___root__cards_account_access__AccountAccess(SvelteComponent): ...
class src_routes__app___layout___root__cards_analytics_card__AnalyticsCard(SvelteComponent): ...
class src_routes__app___layout___root__cards_cards_demo__CardsDemo(SvelteComponent): ...
class src_routes__app___layout___root__cards_claimable_balance__ClaimableBalance(SvelteComponent): ...
class src_routes__app___layout___root__cards_contribution_history__ContributionHistory(SvelteComponent): ...
class src_routes__app___layout___root__cards_dividend_income__DividendIncome(SvelteComponent): ...
class src_routes__app___layout___root__cards_empty_distribute_track__EmptyDistributeTrack(SvelteComponent): ...
class src_routes__app___layout___root__cards_new_milestone__NewMilestone(SvelteComponent): ...
class src_routes__app___layout___root__cards_notification_settings__NotificationSettings(SvelteComponent): ...
class src_routes__app___layout___root__cards_payments__Payments(SvelteComponent): ...
class src_routes__app___layout___root__cards_payout_threshold__PayoutThreshold(SvelteComponent): ...
class src_routes__app___layout___root__cards_power_usage__PowerUsage(SvelteComponent): ...
class src_routes__app___layout___root__cards_qr_connect__QrConnect(SvelteComponent): ...
class src_routes__app___layout___root__cards_savings_targets__SavingsTargets(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_account_access__AccountAccess(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_analytics_card__AnalyticsCard(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_claimable_balance__ClaimableBalance(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_contribution_history__ContributionHistory(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_dividend_income__DividendIncome(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_empty_distribute_track__EmptyDistributeTrack(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_new_milestone__NewMilestone(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_notification_settings__NotificationSettings(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_payments__Payments(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_payout_threshold__PayoutThreshold(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_power_usage__PowerUsage(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_qr_connect__QrConnect(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_savings_targets__SavingsTargets(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_transfer_funds__TransferFunds(SvelteComponent): ...
class src_routes__app___layout___root__cards_skeleton_ui_elements__UiElements(SvelteComponent): ...
class src_routes__app___layout___root__cards_transfer_funds__TransferFunds(SvelteComponent): ...
class src_routes__app___layout___root__cards_ui_elements__UiElements(SvelteComponent): ...

class src_routes__app___layout__examples_dashboard_components_data_table__DataTable(SvelteComponent):
    data: 'Schema[]'

class src_routes__app___layout__examples_dashboard_components_site_header__SiteHeader(SvelteComponent): ...

class src_routes__app___layout__examples_tasks_components_data_table__DataTable(SvelteComponent):
    data: 'Task[]'

class Stats(SvelteComponent): ...
class Step(SvelteComponent, HTMLAttributes[HTMLHeadingElement]): ...
class Steps(SvelteComponent, HTMLAttributes[HTMLElement]): ...
class Strong(SvelteComponent, HTMLAttributes[HTMLElement]): ...

class StylePicker(SvelteComponent):
    submenu: Opt[boolean]

class Svelte(SvelteComponent, SVGAttributes[SVGSVGElement]): ...
class SvelteWhite(SvelteComponent): ...
class Tab(SvelteComponent, HTMLAttributes[HTMLElement]): ...
class Table(SvelteComponent, HTMLAttributes[HTMLTableElement]): ...
class Tabler(SvelteComponent, SVGAttributes[SVGSVGElement]): ...

class TablerIcon(SvelteComponent, SVGAttributes[SVGSVGElement]):
    icon: TablerIconName
    placeholder: Snippet

class TailwindIndicator(SvelteComponent): ...
class Td(SvelteComponent, HTMLTdAttributes): ...
class TeamMembers(SvelteComponent): ...
class TemperatureSelector(SvelteComponent, SliderPrimitive.RootProps): ...
class Th(SvelteComponent, HTMLThAttributes): ...

class ThemeCustomizer(SvelteComponent, HTMLAttributes[HTMLElement]):
    self["class"]: Opt[string]

class ThemeCustomizerCode(SvelteComponent):
    activeTheme: BaseColor | undefined
    activeThemeOKLCH: BaseColorOKLCH | undefined
    copyToClipboard: '(text: string) => void'
    hasCopied: boolean
    tailwindVersion: '"v4-oklch" | "v4-hsl" | "v3"'

class ThemePicker(SvelteComponent):
    submenu: Opt[boolean]

class ThemeSelector(SvelteComponent, HTMLAttributes[HTMLElement]): ...
class TopPSelector(SvelteComponent, SliderPrimitive.RootProps): ...
class Tr(SvelteComponent, HTMLAttributes[HTMLTableRowElement]): ...
class Ts(SvelteComponent, SVGAttributes[SVGSVGElement]): ...
class Ul(SvelteComponent, HTMLAttributes[HTMLUListElement]): ...

class UseClipboard:
    copied: Readonly[boolean]
    delay: number
    lastCopied: Readonly[string | undefined]
    reset: boolean
    status: Readonly['"success" | "failure" | undefined']
    timeout: 'ReturnType[typeof setTimeout] | undefined'
    def __init__(self, __0: Partial[Options] = ...): ...
    async def copy(self, text: string | number) -> Promise["success" | "failure"]: ...

class UserAuthForm(SvelteComponent, HTMLAttributes[HTMLElement]): ...

class UserConfig:
    current: Readonly[UserConfigType]
    def __init__(self, config: UserConfigType): ...
    def setConfig(self, config: Partial[UserConfigType]) -> void: ...

class UserNav(SvelteComponent): ...
class Vega(SvelteComponent, SVGAttributes[SVGSVGElement]): ...

class VisibilityOutline(SvelteComponent):
    userMessages: 'UIMessage[]'

class WelcomeDialog(SvelteComponent): ...

def applyBias[T](
    items: 'readonly T[]',
    context: RandomizeContext,
    biasFilter: BiasFilter[T] = ...,
) -> 'readonly T[]': ...

async def buildRegistry() -> Promise[RegistryItems]: ...
def buildRegistryBase(config: PresetConfig) -> '<inferred>': ...
def buildRegistryTheme(config: DesignSystemConfig) -> '<inferred>': ...
async def buildSearchData() -> 'Promise[SearchEntry[]]': ...
async def collectFiles(currentDir: string, baseDir: string) -> Promise[FileMap]: ...
async def copyText(text: string) -> Promise["success" | "failure"]: ...
async def createContentIndex(data: 'SearchContent[]') -> '<inferred>': ...

def createFileTreeForRegistryItemFiles(
    files: 'Array[{ target: string; type: RegistryItemFile["type"] }] | undefined',
) -> 'FileTree[]': ...

async def createHighlighter() -> '<inferred>': ...
def createIconLoader(iconLibrary: IconLibraryName) -> IconLoader: ...

def findNeighbors(
    pathName: string,
) -> '{ previous: SidebarNavItem | null; next: SidebarNavItem | null }': ...

def generateBaseColorTemplate(baseColor: BaseColor) -> '<inferred>': ...
def getBaseColor(name: BaseColorName) -> '<inferred>': ...
async def getChangelogPages(options: ChangelogPagesOptions = ...) -> 'Promise[ChangelogPage[]]': ...
def getColorsData() -> '<inferred>': ...

def getCommand(
    pm: Agent,
    type: PackageManagerCommand,
    command: 'string | string[]',
) -> ResolvedCommand: ...

def getComponentName(name: string) -> string: ...
async def getDoc(_slug: string) -> 'Promise[{ component: Component; metadata: DocMetadata }]': ...
def getFont(name: FontValue) -> '<inferred>': ...
def getFullNavItems() -> 'Array[SidebarNavItem & { index: number }]': ...
def getIconForLanguageExtension(language: string) -> '<inferred>': ...
def getIconLibrary(name: IconLibraryName) -> '<inferred>': ...
def getMessageText(message: Pick[UIMessage, "parts"]) -> '<inferred>': ...
def getStyle(name: StyleName) -> '<inferred>': ...
def getTheme(name: ThemeName) -> '<inferred>': ...
def getThemeCode(theme: BaseColor | undefined, radius: number) -> '<inferred>': ...
def getThemeCodeHSLV4(theme: BaseColor | undefined, radius: number) -> '<inferred>': ...
def getThemeCodeOKLCH(theme: BaseColorOKLCH | undefined, radius: number) -> '<inferred>': ...
def getThemesForBaseColor(baseColorName: string) -> '<inferred>': ...
def groupItemsByType(items: 'Pick[RegistryItem, "name" | "title" | "type"][]') -> '<inferred>': ...
def isBlock(name: unknown) -> 'name is BlockName': ...
def isBlockName(str: string) -> 'str is BlockName': ...
async def loadHighlighter(language: string) -> '<inferred>': ...
def parseUserConfig(cookie: string) -> UserConfigType: ...
def parseUserConfigJson(value: string | undefined) -> UserConfigType: ...
def parseUserConfigValue(value: unknown) -> UserConfigType: ...
def pascalToKebab(str: string) -> string: ...
def rehypeComponentExample() -> '<inferred>': ...
def searchContentIndex(query: string) -> 'SearchResult[]': ...
def setupDesignSystem() -> IDesignSystemState: ...
def src_lib_colors__getColorFormat(color: Color) -> ColorFormat: ...
def src_lib_colors__getColors() -> 'ColorPalette[]': ...
def src_lib_components_colors_colors__getColorFormat(color: Color) -> '<inferred>': ...
def src_lib_components_colors_colors__getColors() -> '<inferred>': ...

async def src_lib_highlight_code__highlightCode(
    code: string,
    language: string = ...,
) -> Promise[string]: ...

async def src_lib_registry_lib_highlighter__highlightCode(
    code: string,
    language: string,
) -> '<inferred>': ...

def src_routes__app___layout___create__create__item___page__load(__0) -> '<inferred>': ...
def src_routes__app___layout___create__create__page_server__load(__0) -> '<inferred>': ...
def src_routes__app___layout__charts__page__load() -> '<inferred>': ...
def src_routes__app__preview__item___page__load(__0) -> '<inferred>': ...
async def src_routes__view__view__view_view___page__load(__0) -> '<inferred>': ...
def src_routes_discord__server__GET() -> '<inferred>': ...
async def src_routes_init__server__GET(__0) -> '<inferred>': ...
def src_routes_og__server__GET(__0) -> '<inferred>': ...
def src_routes_registry__server__GET() -> '<inferred>': ...
def src_routes_repro__server__GET() -> '<inferred>': ...
def src_routes_rss_xml__server__GET() -> '<inferred>': ...
def syncMenuColor(menuColor: MenuColorValue) -> '() => void': ...
def transformBlockPath(target: string, type: RegistryItemFile["type"]) -> string: ...

async def transformDesignSystem(
    content: string,
    filePath: string,
    designSystem: DesignSystemConfig,
) -> Promise[string]: ...

def transformImportPaths(content: string) -> string: ...

async def updateJsonImport(
    onUpdatingChange: '(isUpdating: boolean) => void' = ...,
) -> '<inferred>': ...

def useDesignSystem() -> IDesignSystemState: ...
def useHighlightedCode(value: '() => string', language: '() => string') -> '<inferred>': ...
def useIsMac() -> '{ readonly current: boolean; readonly cmdOrCtrl: string; readonly optionOrAlt: string }': ...

ActionMenuCtx: '<inferred>'
BASE_COLORS: '<inferred>'
BASE_STYLES: '<inferred>'
BASE_THEMES: '<inferred>'
baseColorsOKLCH: '<inferred>'
baseColorsV4: '<inferred>'
blockMeta: '<inferred>'
blockNames: '<inferred>'
blockSchema: '<inferred>'
BlockViewerContext: '<inferred>'
bodyFonts: '<inferred>'
charts: ChartGroups
ComponentCodeViewerContext: '<inferred>'
config: '<inferred>'
contentDirPath: '<inferred>'
DEFAULT_CONFIG: DesignSystemConfig
designSystemConfigSchema: '<inferred>'
DesignSystemContext: '<inferred>'
FALLBACK_STAR_COUNT: '<inferred>'
FONT_DEFINITIONS: '<inferred>'
FONT_HEADING_OPTIONS: '<inferred>'
FONTS: '<inferred>'
fonts: '<inferred>'
headingFonts: '<inferred>'
hugeiconsIconLoader: '<inferred>'
InitializeProjectCtx: '<inferred>'
labels: '<inferred>'
lucideIconLoader: '<inferred>'
mainNavItems: 'NavItem[]'
match: ParamMatcher
mdsxConfig: '<inferred>'
MENU_ACCENTS: '<inferred>'
MENU_COLORS: '<inferred>'
MESSAGE_ANIMATIONS: '<inferred>'
models: 'Model[ModelType][]'
OG_IMAGE_BASE_URL: '<inferred>'
ogDirPath: '<inferred>'
PACKAGE_MANAGERS: 'Agent[]'
PAGES_NEW: '<inferred>'
PAGES_UPDATED: 'string[]'
phosphorIconLoader: '<inferred>'
PRESETS: 'Preset[]'
presets: 'Preset[]'
priorities: '<inferred>'
RADII: '<inferred>'
RANDOMIZE_BIASES: RandomizeBiases
registryCategories: '<inferred>'
remixiconIconLoader: '<inferred>'
schema: '<inferred>'
sidebarNavItems: 'SidebarNavItem[]'
siteConfig: '<inferred>'
src_lib_components_cards_payments_features__features: '<inferred>'
src_lib_components_theme_customizer__BASE_STYLES_WITH_VARIABLES: '<inferred>'
src_lib_registry_colors__baseColors: '<inferred>'
src_lib_registry_colors__colorMapping: '<inferred>'
src_lib_registry_colors__colors: Colors
src_lib_registry_registry_base_colors__baseColors: '<inferred>'
src_lib_registry_registry_colors__baseColors: '<inferred>'
src_lib_registry_registry_colors__colorMapping: '<inferred>'
src_lib_registry_registry_colors__colors: '<inferred>'
src_lib_registry_templates__BASE_STYLES_WITH_VARIABLES: '<inferred>'
src_lib_registry_themes__THEMES: '<inferred>'
src_lib_themes__THEMES: '<inferred>'
src_routes__app___layout___root___page__prerender: '<inferred>'
src_routes__app___layout__blocks__category___page__entries: EntryGenerator
src_routes__app___layout__blocks__category___page__load: PageLoad
src_routes__app___layout__blocks__category___page__prerender: '<inferred>'
src_routes__app___layout__blocks__category___page_server__entries: EntryGenerator
src_routes__app___layout__blocks__category___page_server__load: PageServerLoad
src_routes__app___layout__blocks__category___page_server__prerender: '<inferred>'
src_routes__app___layout__blocks__page__load: PageLoad
src_routes__app___layout__blocks__page__prerender: '<inferred>'
src_routes__app___layout__charts__t___page__entries: EntryGenerator
src_routes__app___layout__charts__t___page__load: PageLoad
src_routes__app___layout__charts__t___page__prerender: '<inferred>'
src_routes__app___layout__charts__t___page_server__entries: EntryGenerator
src_routes__app___layout__charts__t___page_server__load: PageServerLoad
src_routes__app___layout__charts__t___page_server__prerender: '<inferred>'
src_routes__app___layout__colors__layout__prerender: '<inferred>'
src_routes__app___layout__docs_____slug___page__entries: EntryGenerator
src_routes__app___layout__docs_____slug___page__load: PageLoad
src_routes__app___layout__docs_____slug___page__prerender: '<inferred>'
src_routes__app___layout__docs__layout_server__prerender: '<inferred>'
src_routes__app___layout__docs_changelog__page__load: PageLoad
src_routes__app___layout__docs_changelog__page__prerender: '<inferred>'
src_routes__app___layout__examples__layout__prerender: '<inferred>'
src_routes__app___layout__examples__page__load: PageLoad
src_routes__app___layout__examples_dashboard_components_data_table_features__features: '<inferred>'
src_routes__app___layout__examples_dashboard_data__data: '<inferred>'
src_routes__app___layout__examples_tasks_components_data_table_features__features: '<inferred>'
src_routes__app___layout__examples_tasks_data_tasks__data: '<inferred>'
src_routes__app___layout__load: LayoutLoad
src_routes__app___layout__themes__layout__prerender: '<inferred>'
src_routes__app___layout_server__load: LayoutServerLoad
src_routes__view__view__view_view___page__entries: EntryGenerator
src_routes__view__view__view_view___page__prerender: '<inferred>'
src_routes_api_block__block___server__GET: RequestHandler
src_routes_api_block__block___server__prerender: '<inferred>'
src_routes_api_search_json__server__GET: RequestHandler
src_routes_api_search_json__server__prerender: '<inferred>'
src_routes_rss_xml__server__prerender: '<inferred>'
staticDirPath: '<inferred>'
statuses: '<inferred>'
STYLES: '<inferred>'
tablerIconLoader: '<inferred>'
taskSchema: '<inferred>'
THEME_STYLES_WITH_VARIABLES: '<inferred>'
types: '<inferred>'
USER_CONFIG_COOKIE_NAME: '<inferred>'
UserConfigContext: '<inferred>'
userConfigSchema: '<inferred>'
velite_config: '<inferred>'
veliteDirPath: '<inferred>'
veliteIndexPath: '<inferred>'
vite_config: '<inferred>'
