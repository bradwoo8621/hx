# HxDateTimePicker / HxWithCheckDateTimePicker

日期时间选择器组件，提供基于日历的弹出面板。支持多种历法系统（公历、日本和历、民国纪年、佛历等）、国际化及键盘导航。

`HxWithCheckDateTimePicker` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

```tsx
// 仅日期选择
<HxDateTimePicker
  $model={form} $field="date"
  displayFormat="@d/ymd"
/>

// 日期时间选择
<HxDateTimePicker
  $model={form} $field="datetime"
  displayFormat="@d/ymd :hns"
/>

// 日本和历显示
<HxDateTimePicker
  $model={form} $field="jpDate"
  calendarLocale="ja-JP"
  displayFormat="@d/ymd"
/>

// 带验证
<HxWithCheckDateTimePicker
  $model={form} $field="requiredDate"
  displayFormat="@d/ymd"
  check
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |
| `displayFormat` | `HxDateTimePickerDisplayFormat` | — | 显示格式字符串、模板或函数（函数形式接收 `UTCDate`） |
| `availableParts` | `HxDateTimeRelatedFormat` | 自动检测 | 可用日期时间部分（日期、时间或两者） |
| `defaultValue` | `HxDateTimeDefaultValuesInStr \| HxDateTimeValue` | — | 模型为空时的默认值 |
| `valueFormat` | `HxDateTimeRelatedFormat` | — | 模型绑定的值格式 |
| `firstDayOfWeek` | `'sun' \| 'mon' \| 'default'` | `'default'` | 每周第一天 |
| `weekendDays` | `HxDateWeekendDays \| 'default'` | `'default'` | 周末配置 |
| `calendarLocale` | `'gregory' \| HxLanguageCode` | — | 强制使用指定 locale 或公历 |
| `enterToOpenPopup` | `boolean` | `false` | 按 Enter 打开弹出面板 |
| `spaceToOpenPopup` | `boolean` | `true` | 按 Space 打开弹出面板 |
| `clearable` | `boolean` | `false` | 显示清除按钮 |
| `placeholder` | `boolean` | `true` | 值为空时显示占位文字 |
| `placeholderKey` | `ReactNode` | `'~HxCommon.DateTimePickerPlaceholder'` | 占位文字 |
| `calendarIcon` | `ReactNode` | — | 自定义日历图标 |
| `todayKey` | `ReactNode` | `'~HxCommon.TodayButton'` | "现在"按钮文字 |
| `clearKey` | `ReactNode` | `'~HxCommon.ClearButton'` | "清除"按钮文字 |
| `zIndex` | `number` | — | 弹出面板 z-index |
| `gapToEdge` | `number` | — | 触发器与面板间间距 |

## 支持的日期范围

日期时间选择器的公历日期范围为 **0001/01/01** 至 **9999/12/31**。此边界适用于所有历法系统。

### 全局边界

| 边界 | 公历日期 | 行为 |
|------|---------|------|
| 下限 | 0001/01/01 | 公元纪元起点。公元1年没有上一年；公元1年1月没有上月。没有公元0年（公元前1年 → 公元1年）。 |
| 上限 | 9999/12/31 | 最大可表示日期。9999年没有下一年；9999年12月没有下月。 |

当到达任一边界时，弹出面板头部对应的**上/下年、上/下月导航按钮将被禁用**。

### 非公历经法

非公历经法将导航边界映射到相同的公历纪元下限（0001/01/01）和上限（9999/12/31），以各自历法表示。每种历法实现了精确到日的阈值，考虑了边界处的跨月窗口：

| 历法 | 下限（历法日期） | 上限（历法日期） |
|------|----------------|----------------|
| 公历 | 0001/01/01 | 9999/12/31 |
| 日本和历 | 1/01/03 | 9999/12/31 |
| 民国纪年 | −1911/01/03 | 8088/12/31 |
| 佛历 | 544/01/03 | 10542/12/31 |
| 希伯来历 | 3761/04/18 | 13760/02/28 |
| 伊斯兰历（表格式） | −640/05/20 | 9666/03/30 |
| 伊斯兰历（民用） | −640/05/18 | 9666/04/02 |
| 伊斯兰历（Umalqura） | −640/05/18 | 9666/04/02 |
| 波斯历 | −621/10/11 | 9378/10/10 |
| 科普特历 | −284/05/08 | 9716/02/21 |
| 埃塞俄比亚历 | 5493/05/08 | 9992/02/21 |
| 印度国定历（Saka） | −78/10/11 | 9921/10/10 |

> **这三个历法为何从 01/03 开始：** 日本和历、民国纪年、佛历在 1582 年之前使用儒略历。儒略历的额外闰日累积了 +12 天偏差，1582 年改革移除 10 天，在公元元年净差 +2 天。因此历法 01/01–02 对应公历公元前 12/30–31（被 clamp 至纪元起点），**01/03** 才对应公历 0001/01/01。

> **注意：** 伊斯兰历的三个变体（表格式、民用、Umalqura）的年/月**移动操作**（`moveYear`/`moveMonth`）通过共享的 `DateMoveAnyMonthsProvider` 超类实现（与印度历、波斯历相同的 12 个月机制），月份/年份面板通过共享面板骨架实现。

### 解析与格式化输入行为

日期解析和格式化输入组件对范围边界的处理与选择器不同：

| 层 | 范围校验 |
|----|---------|
| `DateParseUtils.parseValue` | 无语义校验。接受任意数字值（如月份 `"61"` 可被接受）。仅校验字符串结构（分隔符匹配、尾部字符）。 |
| `DateParseUtils.fromParsed` / `toParsed` | 年份 clamp 至 `[0, 9999]`，其他部分 clamp 至 `[0, 99]`。不校验月份 ≤ 12 或日期 ≤ 31。 |
| `HxFormatInput`（日期时间） | 编辑时仅结构校验：每字段位数（年=4，其他=2）、分隔符位置。范围检查（如月份 > 12）**延迟至 blur/submit** 校验。 |
| 负数 | 不支持。`-` 被当作日期分隔符，不作为负号处理。 |

### 回退到 Format-Input

当显示格式不包含完整日期（`y`/`m`/`d` 三者齐全——例如时间-only 或年月格式）时，无法显示日历弹窗。组件不会抛出异常，而是退化为纯 `HxFormatInput`。这是配置错误的软性提示，而非可用的时间-only 模式：输入框 pattern 从 `availableParts` → `valueFormat` → 全局默认（`y/m/dTh:n:s`）推导，`displayFormat` 本身被有意忽略。要获得日历弹窗，请使用完整的日期显示格式（或显式设置 `availableParts` / `valueFormat`）。

## 历法系统

通过 `calendarLocale` 属性支持多种历法系统：

- **公历**（默认）— `calendarLocale="gregory"` 或省略
- **日本和历** — `calendarLocale="ja-JP"`（令和、平成、昭和等年号）
- **民国纪年** — `calendarLocale="zh-TW"`（台湾）
- **佛历（B.E.）** — `calendarLocale="th"`（泰国）
- **科普特历** — `calendarLocale="ar-EG"`（埃及，殉教纪年）
- **埃塞俄比亚历** — `calendarLocale="am-ET"` 或 `"ti-ET"`（埃塞俄比亚/厄立特里亚，道成肉身纪元）
- **希伯来历** — `calendarLocale="he-IL"`（以色列）
- **伊斯兰历** — `calendarLocale="ar-SA"`（沙特阿拉伯）
- **波斯历** — `calendarLocale="fa-IR"`（伊朗；月份与年份面板以波斯历显示，含 BC/10k 边界标记）
- **印度国定历（Saka）** — `calendarLocale="hi-IN"`（印度；月份与年份面板以 Saka 历显示，含 BC/10k 边界标记）

完整的历法映射请参见[日期本地化工具](./cn-hx-components-Utilities#日期本地化)。

### 日历面板

弹层的月份面板与年份面板基于共享的「走步 + 重锚定」骨架（`DateLocaleNotGregorianHelper`）实现；公历-儒略系历法（日本、民国、佛历）通过 `DateLocaleGregorianAndJulianHelper` 额外处理 1582/10 短月。

- **日本和历** — 年份与月份面板完整实现；月份按年号制显示：当月首日年号与前一月不同时显示该年号（1 月恒显示年首年号），并列出月内出现的其他年号——例如 1989/01（1 月 7 日昭和→平成）与 1926/12（12 月 25 日大正→昭和）。年份面板基于连续年（= 公历年，含改革前边界修正）并在年份间正向传播年号；仅有的两个年内三个年号的年份为 1387（元中/至徳/嘉慶）与 749（天平/天平感宝/天平勝宝，均系南北朝重叠），显式处理。唯一三个月内出现三个年号的月份为 1387/8；1582/10 短月（21 天，跳过 5-14 日）经由共享的 Gregorian-and-Julian helper 处理。
- **民国 / 佛历** — 年份与月份面板完整实现，涵盖纪元边界（民国 −1 ↔ 1）、1582 改革跨越与日历上下限钳制。
- **印度国定历（Saka）** — 年份与月份面板完整实现；Saka 历范围 [−78, 9921] 两端均为不完整年，因此 −78 年 1-9 月标记为 `bc`，9921 年 11-12 月标记为 `y10k`。
- **波斯历** — 年份与月份面板完整实现；波斯历范围 [−621, 9378] 两端均为不完整年，因此 −621 年 1-9 月标记为 `bc`，9378 年 11-12 月标记为 `y10k`。
- **伊斯兰历（表格式 / 民用 / Umalqura）** — 年份与月份面板完整实现；伊斯兰历范围 [−640, 9666] 两端均为不完整年，因此 −640 年 1-4 月标记为 `bc`，9666 年 5-12 月标记为 `y10k`。年份面板每步按 353 天/年行走（伊斯兰历一年 354/355 天），再按落点月份回退到穆哈兰姆月 1 日；底部钳制页首格锚定在 −640/1/1（公元前 1 年 8/17），先于历法最早可表示日期——与波斯 −621/1/1 锚点同属预期行为。
- **科普特历 / 埃塞俄比亚历** — 年份与月份面板完整实现；月份面板含 **13 个月格**（12 × 30 天 + 第 13 月 5/6 天）。科普特历范围 [−284, 9716] 两端均为不完整年，因此 −284 年 1-4 月标记为 `bc`，9716 年 3-13 月标记为 `y10k`；埃塞俄比亚历（B.I. 5493–5500、A.I. 1–9992）同样将 5493 年 1-4 月标记为 `bc`，9992 年 3-13 月标记为 `y10k`。
- **希伯来历** — 年份与月份面板完整实现；希伯来历范围 [3761, 13760] 两端均为不完整年，因此 3761 年 1-3 月标记为 `bc`，13760 年 3-12 月标记为 `y10k`。月份按民用月序编号（1 = Tishrei）；闰年时 Adar 拆分为 Adar I / Adar II，网格追加第 13 个月（Elul）。年份面板每步按 353 天/年行走并对年份做迭代修正（希伯来平年 353/354/355 天、闰年 383/384/385 天），翻年步进 355 天并跳过闰月。

年份面板每个格子的日期为**该历法年的第一天**（ICU 语义）；在日历边缘，格子日期可能落在公历 [0001, 9999] 范围之外（例如民国 −1911/1/1 与 Saka −78/1/1 锚定在公元前 1 年）——这是预期行为。点击格子时按格子的年份偏移移动状态日期，从不直接使用格子日期。

### 年号显示与跨年号月份检测

使用**日本和历**（`ja-JP`）时，一个公历月份内可能跨越两个年号。这发生在日本年号更替落在某个月份中间的情况。例如，明治5年（1872年）在月份中期经历年号更替，以及1387年8月的`至徳`/`嘉慶`年号更替。

`HxDateTimePickerStateRef` 上的 `yearHeaderLabel`、`monthHeaderLabel`、`eraOfDays` 方法委托给 `DateLocaleUtils`，后者将非公历调用路由到对应的 `DateLocaleNotGregorianProvider` 插件（例如日语的 `DateJapaneseUtils`）。插件的 `eraOfDays` 实现：

1. 使用 `DateLocaleFormatUtils.formatDateInNumeric()` 检查当月第一天和最后一天的所属年号是否不同。
2. 如果不同，对当月所有日期执行**二分查找**，精确定位年号更替的边界日。
3. 二分查找逻辑：反复检查中间日的年号：
   - 如果中间日仍在第一个年号中，搜索右半部分。
   - 如果中间日已进入新年号，记录该日为候选边界并搜索左半部分。
4. 找到后，将边界日标记为新年号的年号标签，存入 `Map<Date, string>`。

对于1387年8月的`至徳`/`嘉慶`年号更替，存在一个特殊的硬编码处理，因为该场景下 Intl API 的年号检测会产生歧义。

## 内部状态 Ref

`useHxDateTimePickerPopupStateRef` 是日期时间选择器弹出面板的核心状态管理 hook。暴露以下方法：

| 方法 | 说明 |
|------|------|
| `modelValue()` | 从模型获取值（为空时返回 `null`/`undefined`） |
| `stateValue()` | 获取内部状态值（已填充；导航后可能与模型值不同） |
| `formatted()` | 获取格式化标签（年号、年、月、日、星期） |
| `yearHeaderLabel(era, year)` | 获取头部年份标签 |
| `monthHeaderLabel(era, year, month)` | 获取头部月份标签 |
| `eraOfDays(days)` | 获取每日年号标签（用于跨年号月份显示） |
| `isPreviousYearAllowed()` / `isNextYearAllowed()` / `isPreviousMonthAllowed()` / `isNextMonthAllowed()` | 检查历法导航边界 |
| `currentDatePanel()` | 获取当前面板（`'days'` / `'months'` / `'years'`） |
| `switchDatePanel(panel, notifyEvent)` | 切换日期面板 |
| `gregorian()` | 检查是否为公历模式 |
| `language()` | 获取当前语言代码 |
| `weekdays()` | 计算日历网格的星期标签 |
| `days(weekdays)` | 计算日历网格的日期单元格 |
| `months()` | 计算月份面板的月份单元格 |
| `years()` | 计算年份面板的年份单元格 |
| `changeYear(yearOffset, applyToModel)` | 按年偏移导航 |
| `changeMonth(monthOffset, applyToModel)` | 按月偏移导航 |
| `changeDayTo(year, month, day)` | 选择特定日期 |
| `clearModelValue()` | 清除模型值 |
| `clearState()` | 清除全部缓存状态；下次访问时从模型重新读取 |

## 内部事件系统

选择器使用 `EventEmitter` 进行触发器与弹出面板通信：

| 事件 | 说明 |
|------|------|
| `EvtHxDateTimePicker_ValueChange` | 面板中选择了值 |
| `EvtHxDateTimePicker_ValueClear` | 值已清除 |
| `EvtHxDateTimePicker_ClosePopup` | 请求关闭面板 |
| `EvtHxDateTimePicker_GetPicker` | 获取选择器 DOM 节点 |
| `EvtHxDateTimePicker_ArrowKey` | 按下方向键 |

## 键盘导航

- **Enter** — 打开弹出面板（`enterToOpenPopup` 为 `true` 时）
- **Space** — 打开弹出面板（`spaceToOpenPopup` 为 `true` 时，默认启用）
- **Escape** — 关闭弹出面板
- **方向键** — 在日历网格中日期间导航
- **Tab** — 在面板元素间切换焦点

## 全局配置

```ts
import { configHxDateTimePicker } from '@hx/components';
configHxDateTimePicker({
  clearable: true,
  firstDayOfWeek: 'mon',
  todayKey: '~MyApp.Now',
});
```

可用配置选项：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `valueFormat` | `HxDateTimeRelatedFormat` | — | 默认值格式 |
| `clearable` | `boolean` | `false` | 显示清除按钮 |
| `firstDayOfWeek` | `'sun' \| 'mon' \| 'default'` | `'default'` | 每周第一天 |
| `weekendDays` | `HxDateWeekendDays` | `'default'` | 周末日 |
| `forceGregorian` | `boolean` | `true` | 强制使用公历 |
| `enterToOpenPopup` | `boolean` | `false` | 按 Enter 打开面板 |
| `spaceToOpenPopup` | `boolean` | `true` | 按 Space 打开面板 |
| `zIndex` | `number` | — | 面板 z-index 基准 |
| `gapToEdge` | `number` | — | 面板与视口边缘间距 |
| `placeholderKey` | `string` | `'~HxCommon.DateTimePickerPlaceholder'` | 占位文字 i18n 键名 |
| `placeholder` | `boolean` | `true` | 显示占位文字 |
| `todayKey` | `string` | `'~HxCommon.TodayButton'` | "现在"按钮 i18n 键名 |
| `clearKey` | `string` | `'~HxCommon.ClearButton'` | "清除"按钮 i18n 键名 |
| `monthKeyPrefix` | `string` | `'~HxCommon.Month'` | 月份名称 i18n 前缀 |
| `weekdayKeyPrefix` | `string` | `'~HxCommon.Weekday'` | 星期名称 i18n 前缀 |

## 日本和历跨年号月份：二分查找详解

日本和历中可能存在年号在月份中期更替的情况。当使用 `calendarLocale="ja-JP"` 在日历面板中显示月份视图时，状态 ref 的 `eraOfDays` 方法委托给 `DateLocaleUtils.eraOfDays()`，后者路由到 `DateJapaneseUtils.eraOfDays()` —— 日语 `DateLocaleNotGregorianProvider` 插件实现 —— 以检测跨年号月份并精确定位更替日。

算法流程如下：

```
输入:  daysOfThisMonth — 当月所有日期
输出: Map<Date, string> — 日期 → 年号标签（单年号月份返回空 Map）

1.  取当月第一天和最后一天。
2.  将两天格式化为数值形式以获取年号名称：
      eraOfFirstDay, eraOfLastDay
3.  如果 eraOfFirstDay === eraOfLastDay → 返回空 Map（单年号月份）。
4.  否则，对 [0, daysOfThisMonth.length - 1] 执行二分查找：
      a. 计算中间索引。
      b. 将中间日格式化为数值形式以获取年号。
      c. 如果中间日年号 === eraOfFirstDay → 搜索右半部分。
      d. 如果中间日年号 !== eraOfFirstDay → 记录为 foundDay
         并搜索左半部分。
5.  将 foundDay → eraOfLastDay 存入结果 Map。
6.  返回带新年号日期的年号标签 Map。
```

对于 1387 年 8 月（儒略历）的 `至徳`/`嘉慶` 年号更替，存在硬编码覆盖处理，因为该场景下 Intl.DateTimeFormat 产生的年号标签可能不一致。

## 原生 DOM 事件

触发器输入框和弹出面板转发大多数标准 DOM 事件。常用事件：`onFocus`、`onBlur`。值变更通过 `$model`/`$field` 绑定自动处理。
