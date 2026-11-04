# HxFormatInput / HxWithCheckFormatInput

格式化输入组件，支持数字、整数、日期、时间和日期时间格式。由 `HxInputBox(HxFormatInputDispatcher)` 创建。继承所有 `HxInputBox` HOC props，包括 `prefix` / `suffix` 数组。

`HxWithCheckFormatInput` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

```tsx
// 无符号分组整数，最多 7 位
<HxFormatInput $model={form} $field="amount" pattern="@nugd7" />

// 有符号小数，5 位整数 + 2 位小数
<HxFormatInput $model={form} $field="price" pattern="@nd5f2" />

// 无符号、分组、补齐到 2 位小数
<HxFormatInput $model={form} $field="total" pattern="@nugd7f2x" />

// 日期：年/月/日 顺序
<HxFormatInput $model={form} $field="birthDate" pattern="@d/ymd" />

// 日期：月-日-年 顺序
<HxFormatInput $model={form} $field="eventDate" pattern="@d-mdy" />

// 日期时间（含秒）
<HxFormatInput $model={form} $field="createdAt" pattern="@d/ymd :hns" />

// 仅时间
<HxFormatInput $model={form} $field="startTime" pattern="@d:hns" />

// 受 min/max 约束的整数，补零至 2 位
<HxFormatInput $model={form} $field="hour" pattern="@iu23z" />

// 全负值域的整数
<HxFormatInput $model={form} $field="temp" pattern="@il-100u-10" />

// 为空时显示字符占位符（日期时间 options，而不是 prop）
<HxFormatInput $model={form} $field="date" pattern="@d/ymd"
                options={{charPlaceholderOnEmpty: true}} />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `pattern` | `HxFormatInputNumberPattern \| HxFormatInputIntegerPattern \| HxFormatInputDateTimePattern \| ParsedPattern` | — | 模式字符串或解析后的模式对象 |
| `options` | `HxFormatInputDateTimeOptions` | — | 仅日期时间：`{valueFormat?, defaultValue?, charPlaceholderOnEmpty?}` |

外加所有 `HxInputBox` HOC props：`$model`、`$field`、`placeholder`、`prefix`、`suffix`、`$disabled`、`$readonly`、`$domInputBox`。

`forceUseEnFormat` 与 `datetimeCharPlaceholderOnEmpty` 是**全局配置键**，不是组件 props。强制英文的 per-pattern 写法是 `e` 标识；日期时间占位符的实例级开关在 `options.charPlaceholderOnEmpty`。

无法识别的模式会静默降级为普通 `HxInput`，并打印控制台错误。

## 数字模式语法

固定顺序：`@n[u][g][d{N}][f{N}[x]][e]`。裸 `@n` 合法。

| 标识 | 说明 |
|------|------|
| `u` | 无符号——不允许前导负号 |
| `g` | 分组——千分位分隔符 |
| `d{N}` | 最大整数位数（`d0` 表示整数部分只能是 `0`） |
| `f{N}` | 最大小数位数 |
| `x` | 固定显示：把**模型显示值**补齐到至少 `N` 位小数。模型本身多出的小数位会保留；键入仍受 `N` 位限制 |
| `e` | 强制使用 `en` 的分隔符/分组规则 |

分组与小数分隔符跟随当前语言（西文 `333` 或印度 `223`）；`e` 强制 `en`。数字格式化使用截断而非四舍五入。`d` / `f` 限制只是编辑守卫——超出范围的模型值会原样显示。

示例：
- `@nugd7` → 无符号分组整数，最多 7 位
- `@nd5f2` → 有符号小数，5 位整数 + 2 位小数
- `@nugd7f2x` → 无符号、分组、显示补齐到 2 位小数

`toModel` 在无损时返回 `number`，否则返回规范字符串。非法文本原样透传。

## 整数模式语法

模式：`@i[l{low}][u{upper}][z]`

纯整数的轻量模式——无符号规则、无分组、无小数。`l` / `u` 至少指定一个；裸 `@i` 会降级。

| 标识 | 说明 |
|------|------|
| `l{low}` | 最低允许值，可为负数。省略 = `0`；当 `u` 为负数时省略 = `-Infinity` |
| `u{upper}` | 最高允许值，可为负数；省略 = 无上限 |
| `z` | 按 `upper` 的位数补零显示；`min < 0` 或 `max` 无界时忽略 |

行为说明：
- 负数输入由值域本身开启：`min < 0` 时（如 `@il-5u59`）可输入前导负号。
- 单独的负 `max`（`@iu-10`）表示下限无界：值域为 `(-∞, -10]`。
- 边界按字符串比较，任意量级的值都精确；超出 `Number.MAX_SAFE_INTEGER` 的值在模型中保持字符串形式。

示例：
- `@iu23z` → 小时输入 0-23，补零至 2 位
- `@il-100u-10` → 全负值域
- `@iu-10` → 任意小于 -10 的值

## 日期时间模式语法

模式：`@d[/-ymd ][:hns]`。`@d` 之后的字符定义显示顺序和分隔符。

- `y` 年，`m` 月，`d` 日
- `h` 时，`n` 分，`s` 秒
- `/`、`-`、`:` 分隔符；空格分隔日期与时间

合法形式包括 `@d/ymd`、`@d-mdy`、`@d/ymd :hns`、`@d:hns`，以及紧凑形式 `@dymd`、`@dhns`、`@d:h`、`@d:hn`、`@d:ns`。编辑时 `.` 可替代 `/`、`-`、`:`，`T` 可替代空格。

语法规则（违反时打印错误并降级）：

- 日期部分必须连续：`yd` 非法。
- 时间部分必须连续且按 `h < n < s` 顺序；`s` 需要 `n`。
- 分隔符要求所在组至少有两个部分。
- `h` 与任意日期部分同时出现时必须有 `d`。
- 没有小时时，分/秒不允许与日期部分共存。
- 空格分隔符要求日期组和时间组同时存在。

### 日期时间 options 与模型值

```ts
interface HxFormatInputDateTimeOptions {
  valueFormat?: string;                 // dayjs 风格，默认 'y/m/dTh:n:s'
  defaultValue?: string | object;       // 补齐模式中缺失的部分
  charPlaceholderOnEmpty?: boolean;     // 为空时按字符显示 '_'
}
```

`toModel` 总是输出完整的 `valueFormat` 字符串；键入模式中缺失的部分来自 `options.defaultValue`，否则为 `0`。因此仅时间的 `@d:hns` 会写入 `0000/00/00T14:30:00`，除非设置 `valueFormat`（例如 `'h:n:s'`）。

**没有范围校验**：`2024/13/40` 会被接受并原样补齐写出。所有工具包都没有方向键步进。

## 其他行为

- 复制写入剪贴板的是**模型值**（不是显示文本），并调用 `preventDefault`。
- 除非传入 `onDrop`，否则阻止拖放。
- 导出常量：`HxFormatDefaultDatePattern`、`HxFormatDefaultTimePattern`、`HxFormatDefaultDateTimePattern`，以及 number/integer/datetime 工具包和解析器类。

## 原生 DOM 事件

同 [HxInput](./cn-hx-components-Input) 的实用指引：`onChange`/`onInput` 可用但通常多余——值变更由 `$model`/`$field` 处理。`onFocus`/`onBlur`/`onKeyDown` 最为常用。

## 延迟 emit 竞态（已知限制）

当 `emitChangeOnBlur: false` 且 `emitChangeDelay` 为正（默认 150ms）时，每次键入会静默更新模型，而变更事件在延迟后发出。若在延迟窗口内模型值被**外部**修改（如其他组件），延迟事件可能携带过期的 `old`/`new` 值。

- **显示不受影响**：显示在渲染时由模型值派生。
- 仅事件载荷可能过期；消费方应以模型为最终依据。
- `emitChangeOnBlur: true` 无此竞态 —— 事件在失焦时统一发出。

## 全局配置

```ts
import { configHxFormatInput } from '@hx/components';
configHxFormatInput({
  forceUseEnFormat: false,
  datetimeValueFormat: 'y/m/dTh:n:s',
  datetimeCharPlaceholderOnEmpty: false
});
```

`datetimeValueFormat` 会被无条件重新赋值，因此省略它的配置调用会把它重置为传入值（请传完整对象）。

## 模式工具包

内置工具包：`HxFormatInputNumberPatternKit`、`HxFormatInputIntegerPatternKit`、`HxFormatInputDateTimePatternKit`，注册在 `HxFormatInputPatternKitsInner`。抽象基类没有从包入口导出，因此目前无法通过继承它编写自定义工具包；`HxFormatInputPatternKitsInner.register(builder)` 接受一个返回 `[kit, remainingProps]` 或 `false` 的 builder。
