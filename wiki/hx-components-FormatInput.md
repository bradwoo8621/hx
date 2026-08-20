# HxFormatInput / HxWithCheckFormatInput

Formatted input for numbers, dates, times, and datetimes. Created via `HxInputBox(HxFormatInputDispatcher)`. Inherits all `HxInputBox` HOC props.

`HxWithCheckFormatInput` adds validation (see [WithCheck](./hx-components-WithCheck)).

```tsx
// Unsigned grouped integer, max 7 digits
<HxFormatInput $model={form} $field="amount" format="@nugd7" />

// Signed decimal, 5 integer + 2 fraction digits
<HxFormatInput $model={form} $field="price" format="@nd5f2" />

// Unsigned, grouped, exactly 2 fixed fraction digits
<HxFormatInput $model={form} $field="total" format="@nugd7f2x" />

// Date: year/month/day order
<HxFormatInput $model={form} $field="birthDate" format="@d/ymd" />

// Date: month/day/year with dash separator
<HxFormatInput $model={form} $field="eventDate" format="@d-mdy" />

// DateTime with seconds
<HxFormatInput $model={form} $field="createdAt" format="@d/ymd :hns" />

// Time only
<HxFormatInput $model={form} $field="startTime" format="@d:hns" />

// Integer bounded by min/max, zero-padded to 2 digits
<HxFormatInput $model={form} $field="hour" format="@iu23z" />

// Integer in an all-negative domain
<HxFormatInput $model={form} $field="temp" format="@il-100u-10" />

// Show placeholder characters on empty
<HxFormatInput $model={form} $field="date" format="@d/ymd" datetimeCharPlaceholderOnEmpty />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `format` | `string` | — | Pattern string (see syntax below) |
| `forceUseEnFormat` | `boolean` | `false` | Force EN locale for decimal/thousand separators |
| `datetimeCharPlaceholderOnEmpty` | `boolean` | `false` | Show `_` placeholders when datetime field is empty |

Plus all `HxInputBox` HOC props: `$model`, `$field`, `placeholder`, `prefix`, `suffix`, `$disabled`, `$readonly`.

## Number Pattern Syntax

Pattern: `@n[ugd{N}f{N}[x]e]`

| Token | Description |
|-------|-------------|
| `u` | Unsigned — disallow negative values |
| `g` | Grouping — thousand separators |
| `d{N}` | Max integer digits (e.g., `d7`) |
| `f{N}` | Max fraction/decimal digits (e.g., `f2`) |
| `x` | Fixed fraction — exactly `f{N}` decimal places, zero-padded |
| `e` | Force EN locale (same as `forceUseEnFormat`) |

Examples:
- `@nugd7` → unsigned grouped integer, max 7 digits
- `@nd5f2` → signed decimal, 5 integer + 2 fraction
- `@nugd7f2x` → unsigned, exactly 2 decimal places

## Integer Pattern Syntax

Pattern: `@i[l{low}][u{upper}][z]`

A lightweight pattern for plain integers — no sign rules, no grouping, no decimals. At least one bound (`l` / `u`) is required.

| Token | Description |
|-------|-------------|
| `l{low}` | Lowest allowed value, may be negative (`l-5`) |
| `u{upper}` | Highest allowed value, may be negative (`u-10`); lacked = unbounded |
| `z` | Zero-pad the display to the digit width of `upper` |

Behavior notes:
- Negative input is enabled by the domain: when `min < 0` (e.g. `@il-5u59`) a leading minus becomes typable.
- A negative `max` alone (`@iu-10`) means unbounded below: the domain is `(-∞, -10]`.
- Bounds are compared as strings, so values of any magnitude are exact; values beyond `Number.MAX_SAFE_INTEGER` stay as strings in the model.

Examples:
- `@iu23z` → hour input 0-23, padded to 2 digits
- `@il-100u-10` → all-negative domain
- `@iu-10` → anything below -10

## DateTime Pattern Syntax

Pattern: `@d[/-ymd ][:hns]`

Character sequence after `@d` defines display order:
- `y` = year, `m` = month, `d` = day
- `h` = hour, `n` = minute, `s` = second
- Separators: `/`, `-`, `:` (for time components), ` ` (space between date and time)

Examples:
- `@d/ymd` → 2024/12/31
- `@d-mdy` → 12-31-2024
- `@d/dmy :hns` → 31/12/2024 23:59:59
- `@d:hns` → 23:59:59 (time only)

## Native DOM Events

Same practical guidance as [HxInput](./hx-components-Input): `onChange`/`onInput` are available but usually redundant — value changes are handled by `$model`/`$field`. `onFocus`/`onBlur`/`onKeyDown` are the most commonly useful.

## Global Config

```ts
import { configHxFormatInput } from '@hx/components';
configHxFormatInput({ forceUseEnFormat: false });
```

## Pattern Kits

Custom format patterns can be created by extending `AbstractHxFormatInputPatternKit`:

```ts
import { AbstractHxFormatInputPatternKit } from '@hx/components';

class MyKit extends AbstractHxFormatInputPatternKit {
  parse(rawValue: string): ParsedValue { /* ... */ }
  format(parsed: ParsedValue): string { /* ... */ }
}
```

Built-in kits: `HxFormatInputNumberPatternKit`, `HxFormatInputIntegerPatternKit`, `HxFormatInputDateTimePatternKit`.
