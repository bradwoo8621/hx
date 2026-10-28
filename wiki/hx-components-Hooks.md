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

## useHxPopup

Accesses the popup context provided by `HxPopupProvider`. Use it inside popup content to control the popup.

```ts
import { useHxPopup } from '@hx/components';

function PopupContent() {
  const { hide, relayout, on, off, emit } = useHxPopup();
  return <HxButton text="Close" onClick={hide} />;
}
```

`show(triggerEl, options)` requires the trigger element and render options, so opening is normally driven by the trigger component rather than by popup content. `on` / `off` / `emit` provide a custom event channel shared between the trigger and the popup content.

---

## usePopupVisibleRef

Trigger-side visibility manager for `HxPopup`, designed to be used together with `useHxPopup`. It bundles the three things a popup trigger always needs:

- outside `focusin` / `click` detection — closes the popup when the interaction lands outside both the trigger and the popup,
- ancestor `scroll` / `resize` detection — calls `relayout` while the popup is open, and closes it when the trigger scrolls out of view,
- the popup context itself — returned as `context`, so the trigger does not have to call `useHxPopup` separately.

```ts
import { usePopupVisibleRef } from '@hx/components';

const triggerRef = useRef<HTMLDivElement>(null);
const { context, visibleRef } = usePopupVisibleRef({
  elementRef: triggerRef,
  beforeHideByFocusInOrClickOutPopup: () => triggerRef.current?.removeAttribute('data-hx-focus'),
  onFocusInOrClickInPopup: () => triggerRef.current?.setAttribute('data-hx-focus', '')
});

visibleRef.current.show(disabled, {minWidth, maxHeight, position: 'bottom'});  // open
visibleRef.current.hide();                                                    // close
```

`visibleRef.current` exposes `show(disabled, options?)`, `hide()`, `isVisible()` and `clean()`.

`options` is a `HxPopupShowOptions` — `Pick<HxPopupRenderOptions, 'position' | 'alignTo' | 'minWidth' | 'maxHeight'>`. `position` / `alignTo` force the placement, `minWidth` / `maxHeight` size the popup. The same options are reused when an ancestor scrolls or resizes and the popup relayouts.

Use `visibleRef.current.show()` / `.hide()` rather than `context.show()` / `context.hide()`: `show` already calls `context.show(elementRef.current, options)`, and `hide` already calls `context.hide()`. Calling both emits `popup-hide` twice. `clean()` only uninstalls the listeners and is intended for unmount cleanup.

The `disabled` argument does not prevent the popup from opening — it only decides whether the installed listeners react. Guard the call with your own `!disabled` check.

The option callbacks are captured on the first render and are never rebuilt, so keep them pure or only reference stable refs. `ignoreFocusIn` / `ignoreClick` replace the default check instead of extending it: once supplied, the built-in "target is inside `elementRef`" test no longer runs, so returning `false` means "do not ignore this event".

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

---

## useFuncResultRef

Creates a ref whose `current` value is the result of `func`, evaluated once on mount.

```ts
import { useFuncResultRef } from '@hx/components';

const optionsRef = useFuncResultRef(() => createExpensiveOptions());
const options = optionsRef.current;
```

Unlike `useRef(func())` — where the argument is re-evaluated on every render and the result discarded — `func` here runs exactly once (as a lazy `useState` initializer). The returned object keeps a stable identity across renders, so it is safe to put in effect dependency arrays.

`func` is never called again, so it must not depend on changing props or state; later changes are ignored, same as a `useRef` initializer argument.
