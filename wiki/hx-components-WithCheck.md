# HxWithCheck / HxCheckMessage

Validation HOC and standalone message component. Validates model data through custom `handle` functions triggered by reactive field monitoring.

---

## HxWithCheck (HOC)

Wraps any reactive component with validation. Internally subscribes to field changes via `ERO.on()`, calls the `handle` function when monitored fields change, and displays the result as an error/warning message below the wrapped component.

```tsx
import { HxWithCheck } from '@hx/components';

// Wrap a component; $supplyOn supplies the monitor path for rules that omit `on`
const ValidatedInput = HxWithCheck(HxInput, {
  $supplyOn: props => props.$field
});

<ValidatedInput
  $model={form}
  $field="email"
  $check={{
    handle: (event, model) => {
      const v = model.email;
      if (!v) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+$/.test(v)) return 'Invalid email format';
      return undefined;  // pass
    },
  }}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$check` | `DynamicCheck` | — | Validation check (a single rule), see DynamicCheck below |
| `alwaysKeepMessageDOM` | `boolean` | `false` | Always render the message DOM element to prevent layout shift |
| `$domCheckBox` | HTML attributes | — | Extra attributes on the wrapper `<div>` |
| `$domCheckMsg` | HTML attributes | — | Extra attributes on the message `<span>` |

Every prop of the wrapped component is accepted as well and passed through to it. The HOC resolves `$visible`, `$disabled` and `$readonly` itself — the same boolean / function / monitor forms as any other component (the function form is evaluated at mount / parent re-render and does not follow model changes; use the monitor form for model-driven changes) — and hands the resolved booleans down, so the wrapped component and the wrapper `<div>` always agree on the state. The layout props (`fGrow`, `fAlignSelf`, `gRow`, `gRows`, `gCol`, `gCols`, `gJustifySelf`, `gAlignSelf`) are consumed by the wrapper instead of the wrapped component, and the resolved `data-hx-visible`, `data-hx-disabled`, `data-hx-readonly` are written onto the wrapper `<div data-hx-with-check="">` alongside them, so the wrapper can be styled from the outside.

### DynamicCheck

```ts
interface DynamicCheck<T extends object> {
  on?: string | string[];          // field path(s) to monitor; $supplyOn applies when omitted
  handle: MonitorCheckFunc<T>;     // validation function
  scopes?: string | string[];      // scopes of the manual dispatches that run this rule
}

type MonitorCheckFunc<T> = (
  event: ValueChangedEvent,        // the change event that triggered validation, or the manual one
  model: HxObject<T>,              // the reactive model
  context: HxContext               // component context
) => CheckResult;

type CheckResult =
  | undefined                      // pass — no error
  | string                         // error message (shown in red)
  | { level: 'warn' | 'error'; message: ReactNode };  // message with level
```

`$check` takes a single rule. Run several checks of the same field inside one `handle` and return the first failure; when the check depends on other fields, list them all in `on`.

- **`on`**: Which model field path(s) to monitor. When omitted, the HOC uses `$supplyOn` from its creation options (typically the wrapped component's `$field`). With neither, the rule does not run on value changes: a warning is logged, and the rule only runs when it is [dispatched manually](#manual-check). Only the pre-built components (created with `HxWithCheckWithSingleFieldOptions`) supply `$field` automatically.
- **`handle`**: Called when a monitored field changes, and when the rule is dispatched manually. Return `undefined` to pass, a `string` for an error message, or `{ level, message }` for warn/error level messages (warn=yellow, error=red).
- **`scopes`**: Limits the rule to manual dispatches that name one of these scopes; value changes ignore it. See [Manual check](#manual-check).

### Common Patterns

```tsx
// Single-field validation (omitting `on` — only works when the HOC was created with $supplyOn)
<ValidatedInput
  $model={form}
  $field="email"
  $check={{
    handle: (event, model) => {
      if (!model.email) return 'Required';
      return undefined;
    },
  }}
/>

// Multi-field validation (explicit `on`)
<ValidatedInput
  $model={form}
  $field="confirmPassword"
  $check={{
    on: ['password', 'confirmPassword'],
    handle: (event, model) => {
      if (model.password !== model.confirmPassword) return 'Passwords do not match';
      return undefined;
    },
  }}
/>

// Several checks on one field: one handle returns the first failure
<ValidatedInput
  $model={form}
  $field="username"
  $check={{
    handle: (event, model) => {
      if (!model.username) return 'Username is required';
      if (model.username.length < 3) return 'At least 3 characters';
      return undefined;
    },
  }}
/>

// Warning-level message (yellow, non-blocking)
$check={{
  handle: (event, model) => {
    if (model.stock < 10) return { level: 'warn', message: 'Low stock' };
    return undefined;
  },
}}
```

### alwaysKeepMessageDOM

When `true`, the message DOM element always exists (with empty text when no error). This prevents layout shift when validation messages appear/disappear:

```tsx
<ValidatedInput
  $model={form} $field="email"
  $check={{ handle: validateEmail }}
  alwaysKeepMessageDOM
/>
```

### Manual check

Every validated component registers its rule with the provider, so one call runs all of them, for example on submit. `useHxContext().checks.check(callback, scopes?)` runs the registered rules and updates their messages. When a rule returned a message, it calls `callback(true, errors)` in the next animation frame, so that the messages are already rendered. Otherwise it calls `callback(false)` right away.

- `hasError` is `true` when at least one rule returned a message. A `warn` level counts.
- `errors` lists the results in the order the rules ran, each `{ error, el }`: the `CheckResultWithLevel` and the element of its message.
- `el` only assists scrolling to or focusing the message. It is the message element once that element is rendered, and it is absent when the rule renders no message.
- `scopes` selects the rules to run. A rule with `scopes` runs only for a dispatch that names one of them. A rule with `AnyCheckScope` in its `scopes`, or without `scopes`, runs on every dispatch. A dispatch without `scopes`, or with `AnyCheckScope` in its array, runs every rule.

```tsx
const context = useHxContext();

// run every rule, save when none of them returned a message
const onSave = () => {
  context.checks.check(hasError => {
    if (!hasError) save();
  });
};

// run the rules of the "save" scope, and every rule that runs on every dispatch
context.checks.check(onChecked, 'save');
```

```tsx
// a rule that only the "save" dispatch runs
$check={{ scopes: ['save'], handle: (event, model) => model.agreed ? undefined : 'Confirm the terms' }}
```

The rule receives a change event whose `pathToParent` is `ManualCheckField`, because no value changed.

---

## HxCheckMessage

Standalone validation message — useful when the message should appear separately from the input, or for cross-field validation not tied to a single input.

```tsx
<HxCheckMessage
  $model={form}
  $check={{
    on: ['password', 'confirmPassword'],
    handle: (event, model) => {
      if (model.password !== model.confirmPassword) return 'Passwords do not match';
      return undefined;
    },
  }}
  $checkProps={{}}
  $supplyOn={() => ['password', 'confirmPassword']}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$check` | `DynamicCheck` | — | Validation check (a single rule) |
| `$checkProps` | `P` | — | Props forwarded to `$supplyOn` |
| `$supplyOn` | `(props: P) => string \| string[]` | — | Returns field path(s) to monitor; used as `on` for checks that don't specify their own `on` |
| `alwaysKeepMessageDOM` | `boolean` | `false` | Always render message DOM |

While a message is shown, the element carries `data-hx-checked="warn"` or `data-hx-checked="error"`.

---

## Pre-built Validated Components

Each created via `HxWithCheck(BaseComponent, HxWithCheckWithSingleFieldOptions)` (the textarea and upload variants are hand-written wrappers). They accept all base component props plus `$check`, `alwaysKeepMessageDOM`, `$domCheckBox`, `$domCheckMsg`:

| Component | Base |
|-----------|------|
| `HxWithCheckInput` | `HxInput` |
| `HxWithCheckFormatInput` | `HxFormatInput` |
| `HxWithCheckTextarea` | `HxTextarea` |
| `HxWithCheckSelect` | `HxSelect` |
| `HxWithCheckCheckbox` | `HxCheckbox` |
| `HxWithCheckRadio` | `HxRadio` |
| `HxWithCheckMCheckbox` | `HxMCheckbox` |
| `HxWithCheckMRadio` | `HxMRadio` |
| `HxWithCheckMSelect` | `HxMSelect` |
| `HxWithCheckDateTimePicker` | `HxDateTimePicker` |
| `HxWithCheckTable` | `HxTable` |
| `HxWithCheckUpload` | `HxUpload` |

---

## Creating a Custom Validated Component

```tsx
import { HxWithCheck } from '@hx/components';

// Optionally provide $supplyOn to tell the HOC which field(s) to monitor
const ValidatedCustom = HxWithCheck(MyComponent, {
  $supplyOn: (props) => props.$field,  // monitors the component's own $field by default
});
```

When `$supplyOn` is provided, any `DynamicCheck` that omits `on` will use this as its monitor path. This is how `HxWithCheckInput` works — `on` is inferred from `$field`.

## Global Config

```ts
import { configHxWithCheck } from '@hx/components';
configHxWithCheck({ alwaysKeepMessageDOM: false });
```
