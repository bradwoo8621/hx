# Hooks

React hooks exported by `@hx/components`.

---

## useHxInputCompositionHandlers

Wraps IME composition events for an input, buffering text while a CJK composition is active so the model is not updated mid-composition.

```ts
import { useHxInputCompositionHandlers } from '@hx/components';

const { onCompositionStart, onCompositionEnd } = useHxInputCompositionHandlers({
  $model,
  context,
  compositionRef,      // { enabled, text }, shared with the value handlers
  onTextValueChange,   // receives the final text when composition ends
  onCompositionStart: onStart,   // optional, called after the built-in handling
  onCompositionEnd: onEnd        // optional, called after the built-in handling
});
```

While `compositionRef.current.enabled` is `true`, text changes are buffered in `compositionRef.current.text` instead of reaching the model. `onCompositionEnd` clears the flag and forwards the final text to `onTextValueChange`.

---

## useHxInputValueChangeAndCommit

Wires an input's display text to an `@hx/data` model, with two update strategies: debounced (default) and blur-only. It is the shared core of `HxInput`, `HxTextarea` and `HxFormatInput`; use those components unless you are building a custom input.

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
  fromModelValue: fromModel,   // model value -> display string, required
  toModelValue: toModel,       // display string -> model value, identity when omitted
  emitChangeOnBlur,
  emitChangeDelay,
  context,
  valueBeforeEmitRef,
  compositionRef
});
```

- `onTextValueChange(text)` — call on every change and at IME composition end.
- `commitCurrentValue(text)` — call on blur and on Enter: syncs the model with the display text and emits the change event when the value actually changed.

`emitChangeOnBlur` selects the strategy. When `true`, every keystroke writes the model silently and only blur / Enter emits; when `false`, updates are emitted after `emitChangeDelay` milliseconds of inactivity, and `0` emits immediately.

`valueBeforeEmitRef` is a `MutableRefObject<ValueBeforeEmitRefType<T>>` holding the last emitted display value together with the `$model` / `$field` it belongs to. The hook re-derives it from the current model value when that binding changes, so re-binding a mounted input does not emit a spurious change event.

---

## useSelectOptions

Loads the option list for a select-like component and keeps it in a ref.

```ts
import { useSelectOptions } from '@hx/components';

const optionsRef = useSelectOptions({
  $model,                       // required
  $field,                       // required
  captureValueChangeOnOptionsChange: true,  // default
  mainOptionsHolder: false      // true for the component that owns/loads the options
});

optionsRef.current; // { options: Array<HxSelectOption>, loaded: boolean }
```

The hook also subscribes to option load/change events and writes the new value back through `$model` / `$field` when `captureValueChangeOnOptionsChange` is true. Use `useHxSelectOptions()` for the low-level event context (`askOptions`, `onOptionsLoad`, `onValueChange`, …).

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

`isVisible()` asks the popup portal for its lifecycle state (`useHxPopup().isVisible`), so the trigger and the popup always agree. It reports `true` from the moment the popup is shown until the close animation completes.

`options` is a `HxPopupRenderOptions` — `position` / `alignTo` force the placement, `minWidth` / `maxWidth` / `minHeight` / `maxHeight` size the popup. The same options are reused when an ancestor scrolls or resizes and the popup relayouts.

Use `visibleRef.current.show()` / `.hide()` rather than `context.show()` / `context.hide()`: `show` already calls `context.show(elementRef.current, options)`, and `hide` already calls `context.hide()`. Calling both emits `popup-hide` twice. `clean()` only uninstalls the listeners and is intended for unmount cleanup.

The `disabled` argument does not prevent the popup from opening — it only decides whether the installed listeners react. Guard the call with your own `!disabled` check.

The option callbacks are captured on the first render and are never rebuilt, so keep them pure or only reference stable refs. `ignoreFocusIn` / `ignoreClick` replace the default check instead of extending it: once supplied, the built-in "target is inside `elementRef`" test no longer runs, so returning `false` means "do not ignore this event".

---

## useHxTabHeader

Accesses the event-driven context of the enclosing tab header. It has listener registration only. Exported from the package barrel.

```ts
import { useHxTabHeader } from './tab-header-provider';

const tabHeader = useHxTabHeader();
tabHeader.onCheckActive(listener);   // answer check requests
tabHeader.offCheckActive(listener);
tabHeader.onActive(listener);        // hear activation requests
tabHeader.offActive(listener);
```

---

## useHxTabBody

Accesses the event-driven context of the enclosing tab body: `checkActive(callback)`, `checkActiveable(callback)` and `active({markOrIndex, activeCheck?, activeableCheck?})` — the last lets a component inside a tab activate a tab itself (`activeCheck` skips an already-active target, `activeableCheck` respects visibility/disabled, both default `true`). Exported from the package barrel. Outside the tabs subtree, reach it with `findClosestHxTabBody(useHxContext())`.

---

## useHxTabs

Accesses the event-driven context of the tabs container. It has no `tabs` / `activeMark` / `switchToTab` fields. Exported from the package barrel. Outside the tabs subtree, reach it with `findClosestHxTabs(useHxContext())`.

```ts
import { useHxTabs } from './tabs-provider';

const tabs = useHxTabs();
tabs.getActiveMarkAndIndex((index, mark) => { /* ... */ });
tabs.checkActive(markOrIndex, active => { /* ... */ });
tabs.checkActiveable(markOrIndex, activeable => { /* ... */ });
tabs.active(markOrIndex);        // request activation
tabs.doActive(index, mark);      // perform activation after validation
tabs.activeChanged(active, index, mark);
```

Each method has `on…` / `off…` listener counterparts. See `HxTabsContext` for the full list.

---

## useHxHierarchy

Reads the hierarchy context of the nearest `HxHierarchyProvider`. Component contexts (tabs, tab body, tab header, panel, overlay instance, table, table body, table row, table cell) are wrapped into a chain mirroring the React tree, so any component can reach an ancestor context by name. Portal content resolves to its declaration-site ancestors.

```ts
import { useHxContext, useHxHierarchy } from '@hx/components';

const hierarchy = useHxHierarchy();                    // or useHxContext().hierarchy
hierarchy?.closest('HxPanelContext');                 // nearest ancestor by registered name
hierarchy?.ancestors();                               // all React-tree ancestors, nearest first
```

`useHxHierarchyBound(ref)` binds the nearest hierarchy context to a DOM element for the element's lifetime; the element carries `data-hx-hierarchy-context` with the registered name and a symbol-keyed handle. From plain DOM code the same information is reachable without React:

```ts
import { closestBoundHxComponentContext, allHxComponentContexts } from '@hx/components';

// cast to the structural context type you expect
const panel = closestBoundHxComponentContext(el, 'HxPanelContext') as PanelContextLike | undefined;
allHxComponentContexts(el);   // every DOM-bound ancestor context, innermost first
```

The DOM walk collects only DOM-bound ancestors; React-tree ancestors beyond them are reachable from each entry through `closest()` / `ancestors()`.

---

## useHxUpload

Accesses the upload event context. It does not expose the file list directly. **Not exported from the package barrel** — internal to the upload implementation.

```ts
import { useHxUpload } from './upload-provider';

const upload = useHxUpload();
upload.fileUploaded(oldDetails, newDetails);
upload.fileDeleted(file);
upload.clearError();
upload.raiseError(errorNode);
```

Each method has `on…` / `off…` listener counterparts (`onFileUploaded`, `onFileDeleted`, `onClearError`, `onRaiseError`).

---

## useAcceptCheck

Checks that gallery-mode uploads declare image `accept` types and logs a console warning/table when they do not. It returns nothing. **Not exported from the package barrel.**

```ts
import { useAcceptCheck } from './use-accept-check';

useAcceptCheck('gallery', ['image/jpeg', 'image/png']);
```

The signature is `useAcceptCheck(variant: HxUploadVariant, accept?: string | string[])`. To normalize an accept string, use `computeAccept(accept)` — it returns a comma-joined string or `undefined`, not a predicate.

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

---

## Shared Internal Hooks

These are exported for building custom components on the same foundations.

| Hook | Signature / result |
|------|--------------------|
| `useDataMonitor(options)` | Reads `$visible` / `$disabled` / `$readonly` / `$change` from component props and subscribes monitors; returns `{visible, disabled, readonly}` |
| `useCheckMonitor(options)` | Runs the `$check` rule when a monitored field changes and registers it for manual dispatch; returns `{error?: CheckResultWithLevel}`. A rule without `on` uses `$supplyOn`, with neither it only runs on manual dispatch. `elementRef` is the ref of the message element handed to the dispatch |
| `computeMonitorPaths(on, $model, def)` | Normalizes a path or path array to absolute root paths |
| `useForceUpdate()` | Returns a dispatch that re-renders **only the calling component** (never another component or the provider) |
| `useDualRef(fRef)` | Returns a ref to put on the element and keeps the forwarded ref in sync with it: set when the element is attached, cleared when it is detached |
| `useDelayedFunc(defaultTimeout = 100)` | Returns `{delay(key, func, timeout?), clear(key?)}`; async functions are awaited and errors are logged |
| `usePropsToDomExpose(rest, $model, context, dataAttrs?)` | Runs the component's attribute computer, trims consumed props, and adds the tooltip hover wiring |
