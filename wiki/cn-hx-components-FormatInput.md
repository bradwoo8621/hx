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

## 原生 DOM 事件（`<input>` 上）

与 `HxInput` 完全相同。

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

内置工具包：`HxFormatInputNumberPatternKit`、`HxFormatInputDateTimePatternKit`。
