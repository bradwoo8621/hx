# 工具函数

`@hx/components` 导出的工具函数、上下文 Provider 和模式工具包。

---

## 构建内容

从操作/分组定义构建操作菜单内容。

```ts
import { buildContent } from '@hx/components';

const menu = buildContent([
  { label: '编辑', onClick: handleEdit },
  { type: 'separator' },
  { label: '删除', onClick: handleDelete, disabled: true },
]);
```

---

## 数据 / 属性工具

| 导出 | 用途 |
|------|------|
| `HxDataUtils.resolveChildModel($model, $field)` | 解析子 `$model`；槽为 `null` / `undefined` 时静默物化 `{}`（仅对象槽） |
| `HxDataPropToAttrValueComputer` | 按组件注册的 props → `data-hx-*` 属性映射器 |
| `HxCommonDataPropToAttrValueComputerKey` | 共享计算器的注册键（`'HxCommon'`） |
| `HxDataAttributesUtils` | 数据属性计算/归一化辅助 |
| `HxConsole` / `HxConsoleDelegate` | 组件库使用的 console 包装，支持自定义委托 |

## Input 工具函数

输入事件处理器的工厂函数。

```ts
import {
  createHxInputFocusHandler,
  createHxInputKeyDownHandler,
  createHxInputSelectAllHandler,
} from '@hx/components';
```

---

## 重复事件守卫

`DOMUtils` 会在配置的 tag/事件对上丢弃重复触发：只要上一次处理器仍在运行，后续同类事件不会再次调用处理器。默认配置守卫 `button` 的 `click`，覆盖"表单被提交两次"这类问题。

```ts
import { DOMUtils } from '@hx/components';

DOMUtils.getAvoidEventsMultipleTrigger(); // { button: ['click'] }
DOMUtils.setAvoidEventsMultipleTrigger({ button: ['click'], form: ['submit'] });
```

被守卫的事件按以下规则处理：

- 处理器执行前，会在元素上写入一个临时属性 `data-hx-aemt-<event>`；如果该属性已存在，则视为重复触发，事件被忽略、处理器不再调用。
- 同步处理器返回后立即释放守卫；返回 Promise 的处理器会一直持有守卫，直到该 Promise 结束。只跟踪处理器自己返回的 Promise——在别处（例如模型监听器里）启动的异步工作不在覆盖范围内。
- Promise 超过 10 秒仍未结束会通过 `HxConsole` 打印错误。在元素上添加 `data-hx-aemt-suppress-error-report=""` 可以关闭这条报告；守卫本身仍会保留到 Promise 结束。
- 同步抛错保持原有语义；未配置的事件同步透传、行为不变。

`DOMUtils.testAvoidEventsMultipleTrigger(event, mark?)` 对外暴露同一套判断。自定义处理器应在监听器内同步调用它，并在处理结束后移除返回的守卫属性。

---

## 分页工具

从模型（省略 `$field` 时从 `$model` 根）读取并归一化分页数据。底层 `computePaginationData` 是模块私有的。

```ts
import { readPaginationData } from '@hx/components';

const data = readPaginationData(
  {$model: form, $field: 'pagination', allowedPageSizes: [20]},
  context
);
// => { pageNumber: 1, pageSize: 20, totalPages: 1, totalItems }
```

`read` 是可选的 prop 级映射函数 `($model, value, context) => Partial<HxPaginationData>`。所有数值字段会经 `Number` 转换；`pageNumber` 默认 `1`，`pageSize` 默认 `allowedPageSizes[0]`，`totalPages` 默认 `1`。

---

## 上传工具

```ts
import {
  parseFileName,   // (file: HxUploadFile) => [baseName: string, extName: string | undefined]
  mapError,        // (hasUploadError: boolean, message?: string) => string | undefined
  isImage,         // (bytes?: Uint8Array | null) => 'JPEG' | 'PNG' | 'GIF' | 'WEBP' | 'BMP' | 'APNG' | 'AVIF' | false
  toImageSrc,      // (bytes: Uint8Array, type: Lowercase<HxUploadImageType>) => data URL
  releaseImage,    // (url: string) => void —— 释放 object/data URL
} from '@hx/components';
```

`isImage` 通过魔数检测格式。gallery 上传支持 JPEG、PNG、GIF、WEBP、BMP、APNG、AVIF。

---

## Accept 归一化

把 accept 字符串或数组归一化为逗号拼接的 `accept` 属性值。空结果返回 `undefined`——它不是校验函数。

```ts
import { computeAccept } from '@hx/components';

computeAccept(['.pdf', 'image/*']); // '.pdf,image/*'
computeAccept('  ');                // undefined
```

文件类型校验由上传组件根据浏览器 `accept` 值和魔数完成；`useAcceptCheck` 只负责 gallery 模式配置缺失时的警告。

---

## SVG 图标默认值

```ts
import { computeSvgIconDefaults } from '@hx/components';
// 固定默认值——不读取设置：
// 宽高 15，viewBox "0 0 15 15"，fill "none"
// marginT/R/B/L 映射为 data-hx-margin-t/r/b/l
```

---

## 字符串 / 数字 / 文件 / 格式化 / 环境

| 导出 | 用途 |
|------|------|
| `StringUtils` | 字符串辅助（大小写、裁剪、空值判断等） |
| `StringChange` | format-input 编辑使用的字符差异辅助 |
| `NumberUtils` | 本地化数字格式化/解析辅助 |
| `FileUtils.sizeToStr(size)` | 从字节数得到 `[值, 单位]` |
| `HxFmt` / `HxFormatSettings` | label 与日期/值显示共用的格式化器 |
| `AnyUtils` | 小型通用辅助 |
| `DeviceCheck` | 浏览器/设备能力检测 |
| `BodyScrollLock` | 基于 `body-scroll-lock`，供遮罩层使用 |

## Context Provider

内部 Provider，使用 `EventEmitter` 进行跨组件通信：

| Provider | Context API |
|----------|-------------|
| `HxPanelProvider` | `checkCollapsed`、`collapse`、`expand` + `on…` / `off…` 监听器 |
| `HxTabProvider` | `checkActive`、`active` + `on…` / `off…` 监听器 |
| `HxTabsProvider` | `getActive`、`checkActive`、`checkActiveable`、`active`、`doActive`、`activeChanged` + `on…` / `off…` 监听器 |
| `HxUploadProvider` | `fileUploaded`、`fileDeleted`、`clearError`、`raiseError` + `on…` / `off…` 监听器 |
| `HxSelectOptionsProvider` | `askOptions`、`optionsLoad`、`optionsChange`、`valueChange` + `on…` / `off…` 监听器 |
| `HxOverlayInternalContextProvider` | `hide`、`hideComplete` + `onHide` / `offHide` |

这些 Provider 是事件驱动，而不是状态容器。多数属于内部实现、没有从包入口导出（只有 `HxSelectOptionsProvider` 通过 `select-options` 模块重新导出）。不存在 `HxOverlayInternalProvider`；实际组件名是 `HxOverlayInternalContextProvider`。

---

## FormatInput 模式工具包

`HxFormatInput` 使用的内置模式工具包实现和注册表：

```ts
import {
  HxFormatInputNumberPatternKit,
  HxFormatInputIntegerPatternKit,
  HxFormatInputDateTimePatternKit,
  HxFormatInputPatternKitsInner,  // 注册表：@n → number，@i → integer，@d → datetime
} from '@hx/components';
```

抽象基类（`AbstractHxFormatInputPatternKit`）**没有**从包入口导出，因此目前无法通过继承它来编写外部工具包。通过 `HxFormatInputPatternKitsInner.register(builder)` 注册；无法识别的模式会静默降级为普通 `HxInput` 并打印控制台错误。

---

## 日期本地化

`DateLocaleFormatUtils` 使用 `Intl.DateTimeFormat.formatToParts()` 提供各日期/时间部分的本地化格式化。所有格式化均为 **UTC 语义**——日期以 `UTCDate`（基于 JS `Date` 的无时区包装）传入，宿主时区不会影响输出。

```ts
import { DateLocaleFormatUtils, UTCDate } from '@hx/components';

const date = UTCDate.of(2025, 6, 6); // 2025-07-06

// 按 locale 格式化各部分
DateLocaleFormatUtils.formatYear(date, 'ja-JP', false);  // "7年"（年号是独立部分）
DateLocaleFormatUtils.formatYear(date, 'ja-JP', true);   // "2025"（强制公历，仅数字）
DateLocaleFormatUtils.formatMonth(date, 'zh-CN', false); // "7月"
DateLocaleFormatUtils.formatDay(date, 'en-US', true);    // "6"
DateLocaleFormatUtils.formatWeekday(date, 'zh-CN', true); // "日"（省略“周”前缀）
DateLocaleFormatUtils.formatEra(date, 'ja-JP', false);   // "令和"
```

### 插件架构

非公历历法（日本、民国、佛历、韩语、科普特、埃塞俄比亚、希伯来、伊斯兰 ×3、波斯、印度、中国）通过实现 `DateLocaleNotGregorianProvider` 接口的插件系统管理。每个插件声明自己的 `accept()`、`calendar()`、`supportedLanguages()` 以及可选的 `eraAs()` / `yearAs()` / `yearHeaderLabel()` / `monthHeaderLabel()` / `eraOfDays()` / `monthsOfYear()` / `yearsAround()` 方法。历法导航还需要实现 `DateMoveNotGregorianProvider` 的移动插件（`moveYear` / `moveMonth` / 边界钩子），通过 `DateMoveUtils.enableNotGregorianMoveProvider()` 注册。

启用 locale 特定历法支持：

```ts
import {
  DateBuddhistUtils, DateChineseUtils, DateCopticUtils, DateEthiopicUtils,
  DateHebrewUtils, DateIndianUtils, DateIslamicUtils, DateIslamicCivilUtils,
  DateIslamicUmalquraUtils, DateJapaneseUtils, DateKoreanUtils, DateMinguoUtils,
  DatePersianUtils
} from '@hx/components';

DateCopticUtils.enable();           // ar-EG → coptic（科普特殉教纪年）
DateEthiopicUtils.enable();         // am-ET / ti-ET → ethiopic（道成肉身纪元）
DateJapaneseUtils.enable();         // ja / ja-JP → japanese（日本历）
DateMinguoUtils.enable();           // zh-TW / zh-Hant-TW → roc（民国纪年）
DateKoreanUtils.enable();           // ko / ko-KR / ko-KP → 公历（无特殊历法）
DateBuddhistUtils.enable();         // th / th-TH → buddhist（佛历）
DateHebrewUtils.enable();           // he / he-IL → hebrew（希伯来历）
DateIslamicUtils.enable();          // ar-DZ / ar-MA / ar-TN → islamic
DateIslamicCivilUtils.enable();     // ar-AE / ar-IQ / ar-SY / ... → islamic-civil
DateIslamicUmalquraUtils.enable();  // ar-SA / ar-OM / ar-YE / ... → islamic-umalqura
DateIndianUtils.enable();           // hi / hi-IN / en-IN → indian（印度国定历）
DatePersianUtils.enable();          // fa / fa-IR / ckb-IR / ... → persian（波斯历）
DateChineseUtils.enable();          // zh-CN → chinese（农历）

DateCopticUtils.disable();          // 移除科普特插件（每个插件也提供 disable()）
```

科普特历法跨两个纪元：**殉教纪元**（AM，公元 284 年起）和**戴克里先纪元前**。戴克里先纪元前的日期由 `eraAs()` 返回纪元标签 `"ق.د"`；年份本身不再额外添加前缀。

埃塞俄比亚历法跨两个纪元：**道成肉身纪元**（A.I.，公元 8 年起）和**道成肉身纪元前**。`eraAs()` 对阿姆哈拉语返回 `"ዓ.ዓ."`，对提格里尼亚语的纪元前日期返回 `"A.A."`（其他情况返回 `''`）。B.I. 纪元年份范围为 5493–5500（公元 1–8 年）。

波斯历的闰年规则与 ICU（persncal.cpp）一致：基础为 33 年周期 8 闰（年份余数 ∈ {1, 5, 9, 13, 17, 22, 26, 30}），并在波斯历 1502–2987 年由闰日平移表覆盖——每个条目 X 使 X 年变平年、X+1 年变闰年，闰日整体后移一年；2988 年起回到纯 mod-33 规则。移动提供者实现同一规则，保证导航与格式化始终与运行环境 Intl 一致。

**历法解析** — 插件必须先 `enable()`，locale 历法才可用；未注册的 locale 会静默回退到公历。当 `gregorian` 为 `false` 时，`DateLocaleFormatUtils` 通过 `CALENDAR_MAP` 从 locale 解析对应历法，该映射由每个已启用插件的 `supportedLanguages()` 填充：

- `ar-AE` / `ar-BH` / `ar-IQ` / `ar-KW` / `ar-LB` / `ar-QA` / `ar-SY` → `islamic-civil`
- `ar-DZ` / `ar-MA` / `ar-TN` → `islamic`
- `ar-OM` / `ar-SA` / `ar-SD` / `ar-YE` → `islamic-umalqura`
- `fa-AF` / `fa-IR` / `ckb-IR` / `lrc` / `lrc-IR` / `mzn` / `mzn-IR` / `ps-AF` → `persian`
- `uz-Arab` / `uz-Arab-AF` → `persian`

裸 `fa` 和裸 `ps` 不被波斯历插件接受。

- `hi-IN` / `en-IN` / `hi` → `indian`
- `he-IL` / `he` → `hebrew`
- 由插件管理：`am-ET` / `ti-ET` → `ethiopic`，`ar-EG` → `coptic`，`ja` / `ja-JP` → `japanese`，`zh-TW` / `zh-Hant-TW` → `roc`，`th` / `th-TH` → `buddhist`，`zh` / `zh-Hans`（不含 `zh-TW`）→ `chinese`，`ko` / `ko-KR` → 公历（韩语插件接受 locale，但使用公历）

`HxDateTimeFormatCalendar` 支持全部 18 个 ECMA-402 历法值：

```ts
type HxDateTimeFormatCalendar =
  | 'gregory' | 'buddhist' | 'chinese' | 'coptic' | 'dangi'
  | 'ethioaa' | 'ethiopic' | 'hebrew' | 'indian'
  | 'islamic' | 'islamic-civil' | 'islamic-umalqura'
  | 'islamic-tbla' | 'islamic-rgsa'
  | 'iso8601' | 'japanese' | 'persian' | 'roc'
  | string; // 可扩展，支持插件自定义历法
```

### 自定义历法插件

实现 `DateLocaleNotGregorianProvider` 接口添加自定义历法支持：

```ts
import type { DateLocaleNotGregorianProvider } from '@hx/components';
import { DateLocaleFormatUtils } from '@hx/components';

const myPlugin: DateLocaleNotGregorianProvider = {
  accept(lang) { return lang === 'my-LOCALE'; },
  calendar() { return 'dangi'; },
  supportedLanguages() { return ['my-LOCALE']; },
  eraAs(date, partsOf, lang) { /* 自定义年号格式化 */ },
  yearAs(date, partsOf, lang) { /* 自定义年份格式化 */ },
  yearHeaderLabel(value, era, year, lang) { /* 自定义年份标签 */ },
  monthHeaderLabel(value, era, year, month, lang) { /* 自定义月份标签 */ },
  eraOfDays(days, lang) { /* 每日年号标记 */ },
};

DateLocaleFormatUtils.enableNotGregorianLocaleProvider(myPlugin);
DateLocaleFormatUtils.disableNotGregorianLocaleProvider(myPlugin);
```

历法导航还需注册实现 `DateMoveNotGregorianProvider` 的移动插件：

```ts
import { DateMoveUtils, type DateMoveNotGregorianProvider } from '@hx/components';

const myMovePlugin: DateMoveNotGregorianProvider = {
  accept(lang) { return lang === 'my-LOCALE'; },
  moveYear(date, yearOffset, lang) { /* ... */ },
  moveMonth(date, monthOffset, lang) { /* ... */ },
  isPreviousYearAllowed(lang, firstDayOfCurrentMonthOfGregory) { /* ... */ },
  // isNextYearAllowed / isPreviousMonthAllowed / isNextMonthAllowed ...
};

DateMoveUtils.enableNotGregorianMoveProvider(myMovePlugin);
```

`DateLocaleFormatUtils.getWeekInfo()` 从 CLDR 数据读取 locale 的周末和每周第一天：

```ts
const { weekends, firstDayOfWeek } = DateLocaleFormatUtils.getWeekInfo('ar-SA');
// weekends: ['fri', 'sat'], firstDayOfWeek: 'sat'
const { weekends, firstDayOfWeek } = DateLocaleFormatUtils.getWeekInfo('en-US');
// weekends: ['sat', 'sun'], firstDayOfWeek: 'sun'
```

当 `gregorian` 为 `true` 时，所有格式化均使用公历。当 `gregorian` 为 `false` 时，使用 `CALENDAR_MAP` 中对应的 locale 历法，未映射时回退到公历。
