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

为 select 类组件加载选项列表，并把结果保存在 ref 中。

```ts
import { useSelectOptions } from '@hx/components';

const optionsRef = useSelectOptions({
  $model,                       // 必填
  $field,                       // 必填
  captureValueChangeOnOptionsChange: true,  // 默认 true
  mainOptionsHolder: false      // 负责加载/持有选项的组件传 true
});

optionsRef.current; // { options: Array<HxSelectOption>, loaded: boolean }
```

该 hook 还会订阅选项加载/变更事件，并在 `captureValueChangeOnOptionsChange` 为 true 时把新值写回 `$model` / `$field`。底层事件上下文请使用 `useHxSelectOptions()`（`askOptions`、`onOptionsLoad`、`onValueChange` 等）。

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

访问所属标签页的事件驱动上下文。它没有状态字段。**没有从包入口导出**——属于 tabs 的内部实现。

```ts
import { useHxTab } from './tab-provider';

const tab = useHxTab();
tab.checkActive(active => { /* 读取激活标记 */ });
tab.onCheckActive(listener);   // 响应 check 请求
tab.offCheckActive(listener);
tab.active();                  // 请求激活
tab.onActive(listener);
tab.offActive(listener);
```

---

## useHxTabs

访问标签页容器的事件驱动上下文。它没有 `tabs` / `activeMark` / `switchToTab` 字段。**没有从包入口导出**——属于 tabs 的内部实现。

```ts
import { useHxTabs } from './tabs-provider';

const tabs = useHxTabs();
tabs.getActive((index, mark) => { /* ... */ });
tabs.checkActive(markOrIndex, active => { /* ... */ });
tabs.checkActiveable(index, mark, activeable => { /* ... */ });
tabs.active(markOrIndex);        // 请求激活
tabs.doActive(index, mark);      // 校验通过后执行激活
tabs.activeChanged(active, index, mark);
```

每个方法都有对应的 `on…` / `off…` 监听器；完整列表见 `HxTabsContext`。

---

## useHxUpload

访问上传事件上下文。它不直接暴露文件列表。**没有从包入口导出**——属于 upload 的内部实现。

```ts
import { useHxUpload } from './upload-provider';

const upload = useHxUpload();
upload.fileUploaded(oldDetails, newDetails);
upload.fileDeleted(file);
upload.clearError();
upload.raiseError(errorNode);
```

每个方法都有对应的 `on…` / `off…` 监听器（`onFileUploaded`、`onFileDeleted`、`onClearError`、`onRaiseError`）。

---

## useAcceptCheck

检查 gallery 模式上传是否声明了图片 `accept` 类型；未声明时打印控制台警告/表格。它没有返回值。**没有从包入口导出**。

```ts
import { useAcceptCheck } from './use-accept-check';

useAcceptCheck('gallery', ['image/jpeg', 'image/png']);
```

签名为 `useAcceptCheck(variant: HxUploadVariant, accept?: string | string[])`。需要把 accept 归一化为字符串时使用 `computeAccept(accept)`——它返回逗号拼接的字符串或 `undefined`，不是判定函数。

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

---

## 共享内部 Hooks

以下 hook 为构建自定义组件而导出，建立在同一套基础能力上。

| Hook | 签名 / 返回值 |
|------|--------------|
| `useDataMonitor(options)` | 从组件 props 读取 `$visible` / `$disabled` / `$readonly` / `$change` 并订阅监听；返回 `{visible, disabled, readonly}` |
| `useCheckMonitor(options)` | 运行 `$check` 监听；返回 `{error?: CheckResultWithLevel}`。没有 `on` 的校验会被丢弃，除非提供 `$supplyOn` |
| `computeMonitorPaths(on, $model, def)` | 把路径或路径数组归一化为绝对根路径 |
| `useForceUpdate()` | 返回一个只重渲染**调用组件自身**的 dispatch（不会影响其他组件或 provider） |
| `useDualRef(fRef)` | 创建内部 ref，并在挂载后同步到转发 ref |
| `useDelayedFunc(defaultTimeout = 100)` | 返回 `{delay(key, func, timeout?), clear(key?)}`；异步函数会被等待，错误会记录日志 |
| `usePropsToDomExpose(rest, $model, context, options)` | 运行组件的属性计算器、剔除已消费 props，并接线 tooltip 悬停 |
