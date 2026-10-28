# Hooks

`@hx/components` 导出的 React Hooks。

---

## useHxInputCompositionHandlers

为输入组件管理 IME 组合状态。在 CJK（中日韩）IME 输入过程中阻止模型更新。

```ts
import { useHxInputCompositionHandlers } from '@hx/components';

function CustomInput() {
  const { onCompositionStart, onCompositionEnd, onCompositionUpdate } =
    useHxInputCompositionHandlers();
  return <input {...{ onCompositionStart, onCompositionEnd, onCompositionUpdate }} />;
}
```

---

## useHxInputValueChangeAndCommit

管理值变更和模型提交逻辑，支持防抖。

```ts
import { useHxInputValueChangeAndCommit } from '@hx/components';

const { handleChange, handleCommit } = useHxInputValueChangeAndCommit({
  model,
  field,
  emitChangeOnBlur,
  emitChangeDelay,
  onChange,
});
```

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
