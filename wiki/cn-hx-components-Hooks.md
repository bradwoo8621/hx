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

## useHxPopupContext

在弹出层内容中控制弹出层显隐。

```ts
import { useHxPopupContext } from '@hx/components';

function PopupContent() {
  const { show, hide, toggle, isVisible } = useHxPopupContext();
  return <HxButton text="关闭" onClick={hide} />;
}
```

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
