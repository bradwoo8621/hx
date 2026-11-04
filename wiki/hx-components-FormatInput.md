# HxFormatInput / HxWithCheckFormatInput

Formatted input for numbers, integers, dates, times, and datetimes. Created via `HxInputBox(HxFormatInputDispatcher)`. Inherits all `HxInputBox` HOC props, including `prefix` / `suffix` arrays.

`HxWithCheckFormatInput` adds validation (see [WithCheck](./hx-components-WithCheck)).

```tsx
// Unsigned grouped integer, max 7 digits
<HxFormatInput $model={form} $field="amount" pattern="@nugd7" />

// Signed decimal, 5 integer + 2 fraction digits
<HxFormatInput $model={form} $field="price" pattern="@nd5f2" />

// Unsigned, grouped, padded to 2 fixed fraction digits
<HxFormatInput $model={form} $field="total" pattern="@nugd7f2x" />

// Date: year/month/day order
<HxFormatInput $model={form} $field="birthDate" pattern="@d/ymd" />

// Date: month/day/year with dash separator
<HxFormatInput $model={form} $field="eventDate" pattern="@d-mdy" />

// DateTime with seconds
<HxFormatInput $model={form} $field="createdAt" pattern="@d/ymd :hns" />

// Time only
<HxFormatInput $model={form} $field="startTime" pattern="@d:hns" />

// Integer bounded by min/max, zero-padded to 2 digits
<HxFormatInput $model={form} $field="hour" pattern="@iu23z" />

// Integer in an all-negative domain
<HxFormatInput $model={form} $field="temp" pattern="@il-100u-10" />

// Show character placeholders on empty (datetime option, not a prop)
<HxFormatInput $model={form} $field="date" pattern="@d/ymd"
                options={{charPlaceholderOnEmpty: true}} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pattern` | `HxFormatInputNumberPattern \| HxFormatInputIntegerPattern \| HxFormatInputDateTimePattern \| ParsedPattern` | — | Pattern string or parsed pattern object |
| `options` | `HxFormatInputDateTimeOptions` | — | Datetime only: `{valueFormat?, defaultValue?, charPlaceholderOnEmpty?}` |

Plus all `HxInputBox` HOC props: `$model`, `$field`, `placeholder`, `prefix`, `suffix`, `$disabled`, `$readonly`, `$domInputBox`.

`forceUseEnFormat` and `datetimeCharPlaceholderOnEmpty` are **global config keys**, not component props. The per-pattern equivalent of forcing EN is the `e` token; the per-instance datetime placeholder flag lives in `options.charPlaceholderOnEmpty`.

An unrecognized pattern silently downgrades to a plain `HxInput` and logs a console error.

## Number Pattern Syntax

Fixed order: `@n[u][g][d{N}][f{N}[x]][e]`. Bare `@n` is valid.

| Token | Description |
|-------|-------------|
| `u` | Unsigned — no leading minus |
| `g` | Grouping — thousand separators |
| `d{N}` | Max integer digits (`d0` means the integer part must be `0`) |
| `f{N}` | Max fraction digits |
| `x` | Fixed display: pad the **model display** to at least `N` fraction digits. Extra model fraction digits are preserved; typed input is still capped at `N` |
| `e` | Force the `en` locale for separators/grouping |

Grouping and decimal separators follow the current language (`333` Western or `223` Indian); `e` forces `en`. Number formatting truncates rather than rounds. `d` / `f` limits are edit guards — an out-of-range model value displays unmodified.

Examples:
- `@nugd7` → unsigned grouped integer, max 7 digits
- `@nd5f2` → signed decimal, 5 integer + 2 fraction
- `@nugd7f2x` → unsigned, grouped, display padded to 2 fraction digits

`toModel` returns a `number` when the conversion is lossless, otherwise the canonical string. Invalid text passes through.

## Integer Pattern Syntax

Pattern: `@i[l{low}][u{upper}][z]`

A lightweight pattern for plain integers — no sign rules, no grouping, no decimals. At least one bound (`l` / `u`) is required; a bare `@i` downgrades.

| Token | Description |
|-------|-------------|
| `l{low}` | Lowest allowed value, may be negative. Omitted = `0`, or `-Infinity` when `u` is negative |
| `u{upper}` | Highest allowed value, may be negative; omitted = unbounded |
| `z` | Zero-pad the display to the digit width of `upper`; ignored when `min < 0` or `max` is unbounded |

Behavior notes:
- Negative input is enabled by the domain: when `min < 0` (e.g. `@il-5u59`) a leading minus becomes typable.
- A negative `max` alone (`@iu-10`) means unbounded below: the domain is `(-∞, -10]`.
- Bounds are compared as strings, so values of any magnitude are exact; values beyond `Number.MAX_SAFE_INTEGER` stay as strings in the model.

Examples:
- `@iu23z` → hour input 0-23, padded to 2 digits
- `@il-100u-10` → all-negative domain
- `@iu-10` → anything below -10

## DateTime Pattern Syntax

Pattern: `@d[/-ymd ][:hns]`. The characters after `@d` define display order and separators.

- `y` year, `m` month, `d` day
- `h` hour, `n` minute, `s` second
- `/`, `-`, `:` separators; a space separates date and time

Valid forms include `@d/ymd`, `@d-mdy`, `@d/ymd :hns`, `@d:hns`, and compact forms such as `@dymd`, `@dhns`, `@d:h`, `@d:hn`, `@d:ns`. While editing, `.` is accepted for `/`, `-`, `:` and `T` for the space.

Grammar rules (violations log an error and downgrade):

- Date parts must be contiguous: `yd` is invalid.
- Time parts must be contiguous and in `h < n < s` order; `s` requires `n`.
- A separator requires at least two parts in its group.
- `h` with any date part requires `d`.
- Minute/second without hour forbids date parts entirely.
- The space separator requires both a date group and a time group.

### Datetime options and model value

```ts
interface HxFormatInputDateTimeOptions {
  valueFormat?: string;                 // dayjs-like, default 'y/m/dTh:n:s'
  defaultValue?: string | object;       // fills parts missing from the pattern
  charPlaceholderOnEmpty?: boolean;     // show '_' per character when empty
}
```

`toModel` always emits the full `valueFormat` string; parts missing from the typed pattern come from `options.defaultValue`, otherwise `0`. So a time-only pattern such as `@d:hns` writes `0000/00/00T14:30:00` unless you set `valueFormat` (for example `'h:n:s'`).

There is **no range validation**: `2024/13/40` is accepted and passed through padded. There are also no arrow-key step controls in any kit.

## Other Behaviour

- Copy writes the **model** value (not the display text) to the clipboard and calls `preventDefault`.
- Drop is blocked unless you pass an `onDrop` prop.
- Exported constants: `HxFormatDefaultDatePattern`, `HxFormatDefaultTimePattern`, `HxFormatDefaultDateTimePattern`, plus the number/integer/datetime kit and parser classes.

## Native DOM Events

Same practical guidance as [HxInput](./hx-components-Input): `onChange` / `onInput` are available but usually redundant — value changes are handled by `$model` / `$field`. `onFocus` / `onBlur` / `onKeyDown` are the most commonly useful.

## Delayed Emit Race (Known Limitation)

With `emitChangeOnBlur: false` and a positive `emitChangeDelay` (default 150 ms), the model is updated silently on every keystroke while the change event is emitted after the delay. If the model value is changed **externally** inside that window, the delayed event may carry stale `old` / `new` values.

- The **display** is never affected: it is derived from the model value during render.
- Only the event payload can be stale; consumers should treat the model as the source of truth.
- `emitChangeOnBlur: true` has no such race — events are emitted once at blur.

## Global Config

```ts
import { configHxFormatInput } from '@hx/components';
configHxFormatInput({
  forceUseEnFormat: false,
  datetimeValueFormat: 'y/m/dTh:n:s',
  datetimeCharPlaceholderOnEmpty: false
});
```

`datetimeValueFormat` is reassigned unconditionally, so a config call that omits it resets it to the passed value (use the full object).

## Pattern Kits

Built-in kits: `HxFormatInputNumberPatternKit`, `HxFormatInputIntegerPatternKit`, `HxFormatInputDateTimePatternKit`, registered in `HxFormatInputPatternKitsInner`. The abstract base class is not exported from the package barrel, so custom kits cannot currently be authored by extending it; `HxFormatInputPatternKitsInner.register(builder)` accepts a builder that returns `[kit, remainingProps]` or `false`.
