# Hooks

`@hx/components` 导出的 React Hooks。

---

## useHxInputCompositionHandlers

为输入框封装 IME 组合事件：CJK 输入法组合期间先把文本缓冲起来，避免在组合过程中更新模型。

```ts
import { useHxInputCompositionHandlers } from '@hx/components';

const { onCompositionStart, onCompositionEnd } = useHxInputCompositionHandlers({
  $model,
  context,
  compositionRef,      // { enabled, text }，与值处理逻辑共用
  onTextValueChange,   // 组合结束时接收最终文本
  onCompositionStart: onStart,   // 可选，在内置处理之后调用
  onCompositionEnd: onEnd        // 可选，在内置处理之后调用
});
```

`compositionRef.current.enabled` 为 `true` 时，文本变化只会缓冲到 `compositionRef.current.text`，不会写入模型。`onCompositionEnd` 负责清掉标记，并把最终文本交给 `onTextValueChange`。

---

## useHxInputValueChangeAndCommit

把输入框的显示文本绑定到 `@hx/data` 模型，支持两种更新策略：防抖（默认）和失焦提交。它是 `HxInput`、`HxTextarea` 和 `HxFormatInput` 共用的核心逻辑；除非在实现自定义输入，否则直接使用这些组件。

```ts
import { ERO } from '@hx/data';
import { useFuncResultRef, useHxInputValueChangeAndCommit } from '@hx/components';

const context = useHxContext();
const valueBeforeEmitRef = useFuncResultRef(() => ({
  $model,
  $field,
  value: fromModel(ERO.revoke(ERO.getValue($model, $field)), context)
}));
const compositionRef = useRef({ enabled: false, text: '' });

const { onTextValueChange, commitCurrentValue } = useHxInputValueChangeAndCommit({
  $model,
  $field,
  fromModelValue: fromModel,   // 模型值 -> 显示文本，必填
  toModelValue: toModel,       // 显示文本 -> 模型值，省略时原样写入
  emitChangeOnBlur,
  emitChangeDelay,
  context,
  valueBeforeEmitRef,
  compositionRef
});
```

- `onTextValueChange(text)` — 在每次输入变化和 IME 组合结束时调用。
- `commitCurrentValue(text)` — 在失焦和 Enter 时调用：把显示文本同步到模型，值确实发生变化时发出 change 事件。

`emitChangeOnBlur` 决定更新策略：为 `true` 时每次按键都静默写入模型，只有失焦 / Enter 才发出事件；为 `false` 时在 `emitChangeDelay` 毫秒无输入后发出，`0` 表示立即发出。

`valueBeforeEmitRef` 是 `MutableRefObject<ValueBeforeEmitRefType<T>>`，缓存上一次发出的显示值以及它所属的 `$model` / `$field`。绑定变化时，hook 会按当前模型值重新推导它，因此已挂载的输入重新绑定不会发出虚假的 change 事件。

---

## useSelectOptions

访问 select 选项上下文（由 `HxSelectOptionsProvider` 提供）。

```ts
import { useSelectOptions } from '@hx/components';

function CustomOptionRenderer() {
  const { options, selectedValue, searchText, selectOption } = useSelectOptions();
  // ...
}
```

---

## useHxPopup

访问由 `HxPopupProvider` 提供的弹出层上下文。在弹出层内容中使用它来控制弹出层。

```ts
import { useHxPopup } from '@hx/components';

function PopupContent() {
  const { hide, relayout, on, off, emit } = useHxPopup();
  return <HxButton text="关闭" onClick={hide} />;
}
```

`show(triggerEl, options)` 需要触发元素和渲染参数，因此打开动作通常由触发组件发起，而不是由弹出层内容发起。`on` / `off` / `emit` 提供触发组件与弹出层内容之间的自定义事件通道。

---

## usePopupVisibleRef

`HxPopup` 的触发端显隐管理器，设计上与 `useHxPopup` 配合使用。它把触发组件的三件固定工作打包在一起：

- 文档级 `focusin` / `click` 检测——当交互落在触发元素和弹出层之外时关闭弹出层，
- 祖先元素 `scroll` / `resize` 检测——弹出层打开时调用 `relayout`，触发元素滚出视口时关闭，
- 弹出层上下文本身——通过 `context` 返回，触发组件无需再单独调用 `useHxPopup`。

```ts
import { usePopupVisibleRef } from '@hx/components';

const triggerRef = useRef<HTMLDivElement>(null);
const { context, visibleRef } = usePopupVisibleRef({
  elementRef: triggerRef,
  beforeHideByFocusInOrClickOutPopup: () => triggerRef.current?.removeAttribute('data-hx-focus'),
  onFocusInOrClickInPopup: () => triggerRef.current?.setAttribute('data-hx-focus', '')
});

visibleRef.current.show(disabled, {minWidth, maxHeight, position: 'bottom'});  // 打开
visibleRef.current.hide();                                                    // 关闭
```

`visibleRef.current` 提供 `show(disabled, options?)`、`hide()`、`isVisible()` 和 `clean()`。

`isVisible()` 直接向弹出层 portal 查询生命周期状态（内部走 `useHxPopup().isVisible`），因此触发端与弹出层始终一致：从 `show` 开始到关闭动画结束前均返回 `true`。

`options` 是 `HxPopupShowOptions` —— `Pick<HxPopupRenderOptions, 'position' | 'alignTo' | 'minWidth' | 'maxHeight'>`。`position` / `alignTo` 强制指定位置，`minWidth` / `maxHeight` 控制弹出层尺寸。祖先元素滚动或尺寸变化导致弹出层重新定位时，会复用同一份 options。

请使用 `visibleRef.current.show()` / `.hide()`，不要再调 `context.show()` / `context.hide()`：`show` 内部已经调用了 `context.show(elementRef.current, options)`，`hide` 内部已经调用了 `context.hide()`，重复调用会让 `popup-hide` 事件发两次。`clean()` 只卸载监听器，用于组件卸载清理。

`disabled` 参数并不会阻止弹出层打开——它只决定已安装的监听器是否响应。请在调用前自行判断 `!disabled`。

四个选项回调在首次渲染时被捕获且不会重建，因此要保持纯函数，或只引用稳定的 ref。`ignoreFocusIn` / `ignoreClick` 是**替换**默认判断而不是在其之上追加：一旦传入，内置的「目标元素是否位于 `elementRef` 内」判断就不再执行，因此返回 `false` 表示「不忽略该事件」。

---

## useHxTab

访问单个标签页状态。

```ts
import { useHxTab } from '@hx/components';

const { isActive, mark, activate } = useHxTab();
```

---

## useHxTabs

访问标签页容器状态。

```ts
import { useHxTabs } from '@hx/components';

const { tabs, activeMark, switchToTab } = useHxTabs();
```

---

## useHxUpload

访问上传状态和文件操作。

```ts
import { useHxUpload } from '@hx/components';

const { files, uploading, addFiles, removeFile, uploadAll, clearFiles } = useHxUpload();
```

---

## useAcceptCheck

根据 accept 规则（MIME 类型或扩展名）返回文件验证函数。

```ts
import { useAcceptCheck } from '@hx/components';

function MyUpload() {
  const checkAccept = useAcceptCheck(['.pdf', '.docx', 'image/*']);
  const handleFile = (file) => {
    if (!checkAccept(file)) console.error('文件类型不被接受');
  };
}
```

---

## useFuncResultRef

创建一个 ref,其 `current` 为 `func` 的结果,只在挂载时求值一次。

```ts
import { useFuncResultRef } from '@hx/components';

const optionsRef = useFuncResultRef(() => createExpensiveOptions());
const options = optionsRef.current;
```

与 `useRef(func())` 不同——后者的入参每次渲染都会重新求值然后丢弃——这里的 `func` 只执行一次(作为 `useState` 的懒初始化)。返回对象的引用在多次渲染间保持恒定,可以安全地放进 effect 依赖数组。

`func` 之后不会再被调用,因此不能依赖会变化的 props 或 state;后续变化会被忽略,与 `useRef` 的初始化参数一致。
