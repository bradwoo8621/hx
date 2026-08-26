# HxFormatInput / HxWithCheckFormatInput

格式化输入组件，支持数字、日期、时间和日期时间格式。由 `HxInputBox(HxFormatInputDispatcher)` 创建。继承所有 `HxInputBox` HOC props。

`HxWithCheckFormatInput` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

```tsx
// 无符号分组整数，最多 7 位
<HxFormatInput $model={form} $field="amount" format="@nugd7" />

// 有符号小数，5 位整数 + 2 位小数
<HxFormatInput $model={form} $field="price" format="@nd5f2" />

// 无符号、分组、固定 2 位小数
<HxFormatInput $model={form} $field="total" format="@nugd7f2x" />

// 日期：年/月/日 顺序
<HxFormatInput $model={form} $field="birthDate" format="@d/ymd" />

// 日期：月-日-年 顺序
<HxFormatInput $model={form} $field="eventDate" format="@d-mdy" />

// 日期时间（含秒）
<HxFormatInput $model={form} $field="createdAt" format="@d/ymd :hns" />

// 仅时间
<HxFormatInput $model={form} $field="startTime" format="@d:hns" />

// 受 min/max 约束的整数，补零至 2 位
<HxFormatInput $model={form} $field="hour" format="@iu23z" />

// 全负值域的整数
<HxFormatInput $model={form} $field="temp" format="@il-100u-10" />

// 为空时显示占位符
<HxFormatInput $model={form} $field="date" format="@d/ymd" datetimeCharPlaceholderOnEmpty />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `format` | `string` | — | 格式模式字符串（语法见下） |
| `forceUseEnFormat` | `boolean` | `false` | 强制使用英文本地化的小数点/千分位分隔符 |
| `datetimeCharPlaceholderOnEmpty` | `boolean` | `false` | 日期时间字段为空时显示 `_` 占位符 |

外加所有 `HxInputBox` HOC props：`$model`、`$field`、`placeholder`、`prefix`、`suffix`、`$disabled`、`$readonly`。

## 数字模式语法

模式：`@n[ugd{N}f{N}[x]e]`

| 标识 | 说明 |
|------|------|
| `u` | 无符号——不允许负数 |
| `g` | 分组——千分位分隔符 |
| `d{N}` | 最大整数位数（如 `d7`） |
| `f{N}` | 最大小数位数（如 `f2`） |
| `x` | 固定小数位——精确 `f{N}` 位小数，不足补零 |
| `e` | 强制英文本地化（同 `forceUseEnFormat`） |

示例：
- `@nugd7` → 无符号分组整数，最多 7 位
- `@nd5f2` → 有符号小数，5 位整数 + 2 位小数
- `@nugd7f2x` → 无符号，固定显示 2 位小数

## 整数模式语法

模式：`@i[l{low}][u{upper}][z]`

纯整数的轻量模式——无符号规则、无分组、无小数。`l` / `u` 至少指定一个。

| 标识 | 说明 |
|------|------|
| `l{low}` | 最低允许值，可为负数（`l-5`） |
| `u{upper}` | 最高允许值，可为负数（`u-10`）；缺省 = 无上限 |
| `z` | 按 `upper` 的位数补零显示 |

行为说明：
- 负数输入由值域本身开启：`min < 0` 时（如 `@il-5u59`）可输入前导负号。
- 单独的负 `max`（`@iu-10`）表示下限无界：值域为 `(-∞, -10]`。
- 边界按字符串比较，任意量级的值都精确；超出 `Number.MAX_SAFE_INTEGER` 的值在模型中保持字符串形式。

示例：
- `@iu23z` → 小时输入 0-23，补零至 2 位
- `@il-100u-10` → 全负值域
- `@iu-10` → 任意小于 -10 的值

## 日期时间模式语法

模式：`@d[/-ymd ][:hns]`

`@d` 之后的字符序列定义显示顺序：
- `y` = 年，`m` = 月，`d` = 日
- `h` = 时，`n` = 分，`s` = 秒
- 分隔符：`/`、`-`、`:`（时间部分）、` `（日期与时间之间空格）

示例：
- `@d/ymd` → 2024/12/31
- `@d-mdy` → 12-31-2024
- `@d/dmy :hns` → 31/12/2024 23:59:59
- `@d:hns` → 23:59:59（仅时间）

## 原生 DOM 事件

同 [HxInput](./cn-hx-components-Input) 的实用指引：`onChange`/`onInput` 可用但通常多余——值变更由 `$model`/`$field` 处理。`onFocus`/`onBlur`/`onKeyDown` 最为常用。

## 延迟 emit 竞态（已知限制）

当 `emitChangeOnBlur: false` 且 `emitChangeDelay` 为正（默认 150ms）时，每次键入会静默更新模型，而变更事件在延迟后发出。若在延迟窗口内模型值被**外部**修改（如其他组件），延迟事件可能携带过期的 `old`/`new` 值，与实际模型不符。

- **显示不受影响**：显示在渲染时由模型值派生，外部变化立即反映。
- 仅事件载荷可能过期，且仅在短暂的延迟窗口内；消费方应以模型为最终依据。
- `emitChangeOnBlur: true` 无此竞态 —— 事件在失焦时统一发出。

## 全局配置

```ts
import { configHxFormatInput } from '@hx/components';
configHxFormatInput({ forceUseEnFormat: false });
```

## 模式工具包

继承 `AbstractHxFormatInputPatternKit` 可创建自定义格式模式：

```ts
import { AbstractHxFormatInputPatternKit } from '@hx/components';

class MyKit extends AbstractHxFormatInputPatternKit {
  parse(rawValue: string): ParsedValue { /* ... */ }
  format(parsed: ParsedValue): string { /* ... */ }
}
```

内置工具包：`HxFormatInputNumberPatternKit`、`HxFormatInputIntegerPatternKit`、`HxFormatInputDateTimePatternKit`。
