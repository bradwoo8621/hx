# HxWithCheck / HxCheckMessage

Validation HOC and standalone message component. Adds model validation to any reactive component.

## HxWithCheck (HOC)

Wraps any form component with validation rules and error message display.

```tsx
import { HxWithCheck } from '@hx/components';

// Wrap on-the-fly
const ValidatedInput = HxWithCheck(HxInput);

<ValidatedInput
  $model={form}
  $field="email"
  $check={{
    required: true,
    pattern: /^[^\s@]+@[^\s@]+$/,
    message: 'Please enter a valid email',
  }}
/>

// Always keep message DOM for layout stability
<ValidatedInput
  $model={form}
  $field="username"
  $check={{ required: true, minLength: 3 }}
  alwaysKeepMessageDOM
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$check` | `CheckProps` | — | Validation rules object |
| `alwaysKeepMessageDOM` | `boolean` | `false` | Always render message DOM; prevents layout shift |
| `$domCheckBox` | HTML attributes | — | Extra attributes on the wrapper `<div>` |
| `$domCheckMsg` | HTML attributes | — | Extra attributes on the message element |

### Check Rules

| Rule | Type | Description |
|------|------|-------------|
| `required` | `boolean` | Value must be non-empty |
| `pattern` | `RegExp` | Value must match the regex |
| `minLength` | `number` | Minimum string length |
| `maxLength` | `number` | Maximum string length |
| `custom` | `(value, model?) => true \| string` | Custom validator. Return `true` for valid, or an error message string |
| `message` | `string` | Custom error message (overrides default) |

### Custom Validators

```tsx
// Simple custom check
$check={{ custom: (v) => v >= 18 || 'Must be at least 18' }}

// Cross-field validation
$check={{
  custom: (value, model) => {
    if (model.password !== model.confirmPassword) return 'Passwords do not match';
    return true;
  },
}}
```

---

## HxCheckMessage

Standalone validation message display — useful for cross-field validation or when the message should appear separately from the input.

```tsx
<HxCheckMessage
  $model={form}
  $check={{
    custom: (_, m) => m.password === m.confirmPassword ? true : 'Passwords do not match',
  }}
  $checkProps={{}}
  $supplyOn={() => ['password', 'confirmPassword']}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$check` | `CheckProps` | — | Validation rules |
| `$checkProps` | `P` | — | Props forwarded to `$supplyOn` |
| `$supplyOn` | `(props: P) => CheckPropSuppliedOn` | — | Returns array of field paths to monitor for re-validation |
| `alwaysKeepMessageDOM` | `boolean` | `false` | Always render message DOM |

---

## Pre-built Validated Components

Each created via `HxWithCheck(BaseComponent)`, accepting all base props plus `$check`, `alwaysKeepMessageDOM`, `$domCheckBox`, `$domCheckMsg`:

| Component | Base |
|-----------|------|
| `HxWithCheckInput` | `HxInput` |
| `HxWithCheckFormatInput` | `HxFormatInput` |
| `HxWithCheckTextarea` | `HxTextarea` |
| `HxWithCheckSelect` | `HxSelect` |
| `HxWithCheckCheckbox` | `HxCheckbox` |
| `HxWithCheckRadio` | `HxRadio` |
| `HxWithCheckUpload` | `HxUpload` |

```tsx
<HxWithCheckInput $model={form} $field="email" $check={{ required: true }} />
<HxWithCheckSelect $model={form} $field="country" $check={{ required: true }} options={list} />
```

## Global Config

```ts
import { configHxWithCheck } from '@hx/components';
configHxWithCheck({ alwaysKeepMessageDOM: false });
```
