# 组件设计（代码层面）

本页介绍 `@hx/components` 作为**代码**是如何工程化的——每个组件背后反复出现的模式,以及这些模式带来的好处。它不讨论视觉设计(样式令牌见[公共概念](./cn-hx-components-Common),`data-hx-*` 清单见 [Data Attributes 参考](./cn-hx-components-Data-Attributes))。一旦看懂下面六七条理念,那约 35 个组件就不再是一堆零散控件,而是一套系统。

---

## 1. 可组合的 Props 类型——同一套 API,处处一致

组件从不重复定义同一个概念。`src/types/` 里的小型共享接口通过组合复用:

- `HxStdProps` = `$visible` + 变更类 props;`HxEditProps` 增加 `$disabled`;`HxEditSingleFieldProps` 再增加 `$model`/`$field`。
- `HxCommonProps<ExDAT, T>` 打包了宽高、padding/margin、border、flex-cell、grid-cell 等 props,**外加**一个带类型的 `data-hx-*` 透传索引签名。每个组件在自己拥有的 `Excluded…DataAttrNames` 联合里声明哪些 `data-hx-*` 属性由它管理,并作为 `ExDAT` 传入——组件自身写出的属性不进入其公开 props。
- 尺寸使用严格的令牌联合类型(`HxColor`、`HxSize`、`HxPadding`、`HxBorderRadius` 等),与设计令牌一一对应。裸 CSS 长度走 `style`,不走这些 props。

**好处——学一次,处处可用。** `color`、`variant`、`paddingX`、`border`、`$visible`、`$disabled` 在任意组件上含义一致,团队不再反复翻属性表,而是能预测 API。扩展与覆盖落在类型化的 `data-hx-*` 索引签名里,组件在不必加宽自身 props 的前提下保持可扩展。

## 2. 通过 Data 属性做样式——不引入 CSS-in-JS

组件渲染普通 DOM,以 `data-hx-*` 属性作为样式/状态表面:

```html
<button data-hx-button data-hx-color="danger" data-hx-button-variant="solid" data-hx-disabled="">删除</button>
```

- **组件类型标记**(`data-hx-button`、`data-hx-label` 等)始终写在根元素上——CSS 所有规则都锚定在这个稳定选择器上。
- 状态(hover、active、focus、disabled、checked 等)同样是属性,因此 **CSS 原生响应状态**——无需 JS 摆弄 class、无需内联样式 diff。
- props 到属性的映射集中在一个按组件注册的 `HxDataPropToAttrValueComputer` 上(见 [Utilities](./cn-hx-components-Utilities));`DOMUtils.exposePropsToDOM()` 执行该计算器,**剪掉它消费掉的 props**(`trimOffKeys`)使其不会漏到 DOM,再展开其余部分。属性值可以是 `($model, context)` 的函数,并做归一化(`true` → `''`,`false`/`null` → 属性缺省)。

**好处——无需 JS 的样式。** 包体里没有 CSS-in-JS 运行时,状态变化时没有样式标签 diff,应用侧也不用猜特异性:消费方直接定位 `[data-hx-button][data-hx-color="danger"]`。因为状态在属性里,同一条 CSS 规则同时覆盖鼠标与键盘焦点。

## 3. 槽变量 + 级联层——覆盖不再是一场战斗

hx 树中每个元素的外观都由**槽自定义属性**(`--hx-*-this` / `--hx-*-this-default`)派生:

- `src/styles/common/` 里的共享规则消费槽位;`src/styles/components/<name>/` 里的按组件模块提供槽默认值。
- 想覆盖组件的某一方面,只需设置**一个槽**(`--hx-button-font-family`、`--hx-bg-color-this-default` 等),而无需重写其内部。

所有 hx 样式表都导入 `hx` 级联层(`@layer hx`)。未分层的应用 CSS 因此**无论特异性高低都恒优于 hx 规则**——不需要 `!important`,不需要 `:where()` 兜底(见 [Common](./cn-hx-components-Common#级联层cascade-layer))。

**好处——默认让消费方赢。** 一行未分层规则即可翻转整个组件外观;库也不会与宿主打架:你的标记、你的主题、你说了算。

## 4. 设计令牌是唯一的尺度

所有间距、尺寸、颜色与排版都来自 `src/styles/variables/` 下按类别拆分的令牌模块(见 [Common](./cn-hx-components-Common#样式约定))。因为 props 联合直接映射令牌,`paddingX="md"` 与 `--hx-padding-x-…` 是同一种语言。

**好处——一致的节奏,可切换的主题。** 换肤就是换令牌,而不是逐个组件苦战;组件永远不会漂移出临时的魔法像素值。

## 5. 响应式绑定——`$model` / `$field`

表单类组件通过 `ERO` 响应式系统读写绑定,且 `$model` **自动传递给子组件**(`DOMUtils.interposeToChildren()`),因此只需在顶层容器设置一次。`$visible` / `$disabled` / `$readonly` 接受模型的谓词函数以表达派生 UI 状态;转发的事件回调收到 `(event, model, context)`。

**好处——没有 prop 钻取,没有派生状态啰嗦代码。** 大表单只声明一次 `$model`,子字段各自写 `$field`;依赖数据的显隐/禁用用函数表达,而非靠临时 `useEffect` 同步状态。

## 6. 渲染时读取的全局配置

每个组件组暴露 `configHx*()`。默认值位于模块级并在**渲染时读取**(非闭包捕获),所以配置即时全局生效;显式传入的 prop 始终优先。

**好处——库级默认值、应用级覆盖、零迁移成本。** 可以为所有消费方提供一致的组件默认值,而单个消费方仍能不改配置地微调单个实例。

## 7. Provider 作用域的事件总线

Popup、Select、DateTimePicker、Actions、Upload 通过限定在 provider 作用域内的 `EventEmitter` 实例(`EvtHx*` 频道名)在各自内部树之间通信,而不是把状态提升到共享根节点,也不是让回调 props 穿过每一层。

**好处——内部解耦、选择性重渲染。** 打开的弹出层可以把焦点/悬停/选中事件推给子节点而无需重渲染整棵页面树;因为没有任何全局变化,父节点保持安静。

## 8. 可安全嵌入的 Reset

组件库只重置自己的部分:`box-sizing` 与 `position: relative` 仅作用于 `[data-hx-root]` / `[data-hx-portal-root]` 子树内,`html`/`body` 重置通过 `data-hx-reset-styles` 显式开启(见 [Common](./cn-hx-components-Common#全局重置))。

**好处——开箱即用且不破坏宿主页面。** 把 hx 组件嵌进既有应用不会污染宿主的盒模型,级联层也保证 hx 样式不会压过应用自身样式。

## 9. 键盘与指针共享同一状态

可聚焦的弹出层用同一个高亮驱动网格:真正的焦点落在容器上,单元格只是视觉标记,鼠标悬停驱动同一个高亮(悬停跟随)。见 [DateTimePicker](./cn-hx-components-DateTimePicker#键盘导航)。

**好处——几乎免费获得无障碍一致性。** 键盘路径与鼠标路径不可能分叉,因为它们本就是同一份状态。

---

## 坦率地说说代价

- **CSS 本身就是 API。** 换肤与覆盖需要针对属性选择器写 CSS;没有 JS 友好的 `sx` prop 可以兜底。
- **DOM 里多出属性。** 在 devtools 中可见的 `data-hx-*` 表面,每个元素增加少量字节——这是把样式留在纯 CSS 的代价。
- **需要自律来保持选择器作用域。** 这套机制成立的前提是:组件都在根元素写类型标记、并把自有属性登记进排除列表;一旦某个组件破坏这个约定,就会悄悄泄漏样式怪癖。

合在一起,回报正是库的长期生命力里最能复利的那几项:**一致性靠组合天然达成、主题靠令牌一键切换、覆盖靠一行纯 CSS、绑定靠一个 model、内部只重渲染真正变化的部分。** 这就是这套代码的设计。
