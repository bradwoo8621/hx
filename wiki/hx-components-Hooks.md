# Hooks

React hooks exported by `@hx/components`.

---

## useHxInputCompositionHandlers

Manages IME composition state for input components. Prevents model updates during CJK IME composition.

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

Manages value change and model commit logic with debounce support.

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

Accesses the select options context (provided by `HxSelectOptionsProvider`).

```ts
import { useSelectOptions } from '@hx/components';

function CustomOptionRenderer() {
  const { options, selectedValue, searchText, selectOption } = useSelectOptions();
  // ...
}
```

---

## useHxPopupContext

Controls popup visibility from within popup content.

```ts
import { useHxPopupContext } from '@hx/components';

function PopupContent() {
  const { show, hide, toggle, isVisible } = useHxPopupContext();
  return <HxButton text="Close" onClick={hide} />;
}
```

---

## useHxTab

Accesses individual tab state.

```ts
import { useHxTab } from '@hx/components';

const { isActive, mark, activate } = useHxTab();
```

---

## useHxTabs

Accesses the tabs container state.

```ts
import { useHxTabs } from '@hx/components';

const { tabs, activeMark, switchToTab } = useHxTabs();
```

---

## useHxUpload

Accesses upload state and file operations.

```ts
import { useHxUpload } from '@hx/components';

const { files, uploading, addFiles, removeFile, uploadAll, clearFiles } = useHxUpload();
```

---

## useAcceptCheck

Returns a file validation function based on accept rules (MIME types or extensions).

```ts
import { useAcceptCheck } from '@hx/components';

function MyUpload() {
  const checkAccept = useAcceptCheck(['.pdf', '.docx', 'image/*']);
  const handleFile = (file) => {
    if (!checkAccept(file)) console.error('File type not accepted');
  };
}
```
