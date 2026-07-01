# HxWithCheck / HxCheckMessage

Validation HOC and standalone message component. Validates model data through custom `handle` functions triggered by reactive field monitoring.

---

## HxWithCheck (HOC)

Wraps any reactive component with validation. Internally subscribes to field changes via `ERO.on()`, calls the `handle` function when monitored fields change, and displays the result as an error/warning message below the wrapped component.

```tsx
import { HxWithCheck } from '@hx/components';

// Wrap a component
const ValidatedInput = HxWithCheck(HxInput);

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
| `$check` | `DynamicCheck \| DynamicCheck[]` | — | Validation check(s) — see DynamicCheck below |
| `alwaysKeepMessageDOM` | `boolean` | `false` | Always render the message DOM element to prevent layout shift |
| `$domCheckBox` | HTML attributes | — | Extra attributes on the wrapper `<div>` |
| `$domCheckMsg` | HTML attributes | — | Extra attributes on the message `<span>` |

### DynamicCheck

```ts
interface DynamicCheck<T extends object> {
  on?: string | string[];          // field path(s) to monitor
  handle: MonitorCheckFunc<T>;     // validation function
}

type MonitorCheckFunc<T> = (
  event: ValueChangedEvent,        // the change event that triggered validation
  model: HxObject<T>,              // the reactive model
  context: HxContext               // component context
) => CheckResult;

type CheckResult =
  | undefined                      // pass — no error
  | string                         // error message (shown in red)
  | { level: 'warn' | 'error'; message: ReactNode };  // message with level
```

- **`on`**: Which model field path(s) to monitor. When omitted, the HOC uses `$supplyOn` from its creation options (typically the wrapped component's `$field`). If neither is provided, validation never triggers.
- **`handle`**: Called when a monitored field changes. Return `undefined` to pass, a `string` for an error message, or `{ level, message }` for warn/error level messages (warn=yellow, error=red).

### Common Patterns

```tsx
// Single-field validation (omitting `on` — uses the component's $field)
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

// Multiple checks on different fields
<ValidatedInput
  $model={form}
  $field="username"
  $check={[
    {
      handle: (event, model) => model.username ? undefined : 'Username is required',
    },
    {
      handle: (event, model) => {
        if (model.username && model.username.length < 3) return 'At least 3 characters';
        return undefined;
      },
    },
  ]}
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
| `$check` | `DynamicCheck \| DynamicCheck[]` | — | Validation check(s) |
| `$checkProps` | `P` | — | Props forwarded to `$supplyOn` |
| `$supplyOn` | `(props: P) => string \| string[]` | — | Returns field path(s) to monitor; used as `on` for checks that don't specify their own `on` |
| `alwaysKeepMessageDOM` | `boolean` | `false` | Always render message DOM |

---

## Pre-built Validated Components

Each created via `HxWithCheck(BaseComponent)`. They accept all base component props plus `$check`, `alwaysKeepMessageDOM`, `$domCheckBox`, `$domCheckMsg`:

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
