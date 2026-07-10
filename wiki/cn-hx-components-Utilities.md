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

## 分页工具

根据原始条目/页数计算 `HxPaginationData`：

```ts
import { computePaginationData } from '@hx/components';

const data = computePaginationData(150, 20, 1);
// => { pageSize: 20, pageNumber: 1, totalPages: 8, totalItems: 150 }
```

---

## 上传工具

```ts
import {
  parseFileName,   // (name: string) => { name: string, ext: string }
  mapError,        // (error: unknown) => 用户友好的字符串
  isImage,         // (file: HxUploadFile) => boolean
  toImageSrc,      // (bytes: ArrayBuffer) => data: URL 字符串
  releaseImage,    // (src: string) => undefined —— 释放 object URL
} from '@hx/components';
```

---

## Accept 校验

将 accept 字符串/数组规范化为验证函数：

```ts
import { computeAccept } from '@hx/components';

const check = computeAccept(['.pdf', 'image/*']);
check({ name: 'doc.pdf', mimeType: 'application/pdf' });   // true
check({ name: 'photo.jpg', mimeType: 'image/jpeg' });      // true
check({ name: 'data.exe', mimeType: 'application/x-msdownload' }); // false
```

---

## SVG 图标默认值

```ts
import { computeSvgIconDefaults } from '@hx/components';
// 根据设置计算默认尺寸和样式
```

---

## Context Provider

内部 Provider，使用 `EventEmitter` 进行跨组件通信：

| Provider | 提供的状态 |
|----------|-----------|
| `HxPanelProvider` | `{ collapsed, toggle }` |
| `HxTabProvider` | `{ isActive, mark, disabled, activate }` |
| `HxTabsProvider` | `{ tabs, activeMark, switchToTab, restoreScroll }` |
| `HxUploadProvider` | `{ files, errors, uploading, addFiles, removeFile, uploadAll, clearFiles }` |
| `HxSelectOptionsProvider` | `{ options, selectedValue, searchText, selectOption }` |
| `HxOverlayInternalProvider` | 生命周期：`entering → entered → exiting → exited` |

---

## FormatInput 模式工具包

`HxFormatInput` 的抽象基类和内置实现：

```ts
import {
  AbstractHxFormatInputPatternKit,
  HxFormatInputNumberPatternKit,
  HxFormatInputDateTimePatternKit,
  HxFormatInputPatternKitsInner,  // 注册表：@n → NumberKit，@d → DateTimeKit
} from '@hx/components';

class MyKit extends AbstractHxFormatInputPatternKit {
  parse(raw: string): ParsedValue { /* ... */ }
  format(parsed: ParsedValue): string { /* ... */ }
}
```

---

## 日期本地化

`DateLocaleUtils` 使用 `Intl.DateTimeFormat.formatToParts()` 提供各日期/时间部分的本地化格式化。

```ts
import { DateLocaleUtils, type HxDateTimeFormatCalendar } from '@hx/components';

const date = new Date(2025, 6, 6, 15, 30, 0);

// 按 locale 格式化各部分（返回带字面量后缀的字符串）
DateLocaleUtils.formatYear(date, 'ja-JP', false);     // "令和7年"
DateLocaleUtils.formatYear(date, 'zh-CN', true);       // "2025年"（强制公历）
DateLocaleUtils.formatMonth(date, 'zh-CN', false);     // "7月"
DateLocaleUtils.formatDay(date, 'en-US', true);        // "6"
DateLocaleUtils.formatWeekday(date, 'zh-CN', true);    // "周日"
```

**历法解析** — 当 `gregorian` 为 `false` 时，`DateLocaleUtils` 通过 `CALENDAR_MAP` 从 locale 解析对应历法：
- `ja-JP` / `ja` → `japanese`（令和/平成/昭和）
- `zh-TW` / `zh-Hant-TW` → `roc`（民国纪年）
- `hi-IN` / `en-IN` / `hi` → `indian`
- `he-IL` / `he` → `hebrew`
- `ar-EG` → `coptic`
- `ar-AE` / `ar-BH` / `ar-IQ` / `ar-KW` / `ar-LB` / `ar-QA` / `ar-SY` → `islamic-civil`
- `ar-DZ` / `ar-MA` / `ar-TN` → `islamic`
- `ar-OM` / `ar-SA` / `ar-SD` / `ar-YE` → `islamic-umalqura`
- `fa` / `fa-AF` / `fa-IR` / `ckb-IR` → `persian`
- `ps` / `ps-AF` → `persian`
- `mzn` / `mzn-IR` / `lrc` / `lrc-IR` → `persian`
- `uz-Arab` / `uz-Arab-AF` → `persian`
- `th` / `th-TH` → `buddhist`

`HxDateTimeFormatCalendar` 支持全部 18 个 ECMA-402 历法值：

```ts
type HxDateTimeFormatCalendar =
  | 'gregory' | 'buddhist' | 'chinese' | 'coptic' | 'dangi'
  | 'ethioaa' | 'ethiopic' | 'hebrew' | 'indian'
  | 'islamic' | 'islamic-civil' | 'islamic-umalqura'
  | 'islamic-tbla' | 'islamic-rgsa'
  | 'iso8601' | 'japanese' | 'persian' | 'roc';
```

运行时自定义历法映射：

```ts
DateLocaleUtils.updateCalendarMap({ 'ar-SA': 'islamic-umalqura' });
DateLocaleUtils.clearPredefinedCalendars(); // 移除所有默认映射
```

`DateLocaleUtils.getWeekInfo()` 从 CLDR 数据读取 locale 的周末和每周第一天：

```ts
const { weekends, firstDayOfWeek } = DateLocaleUtils.getWeekInfo('ar-SA');
// weekends: ['fri', 'sat'], firstDayOfWeek: 'sat'
const { weekends, firstDayOfWeek } = DateLocaleUtils.getWeekInfo('en-US');
// weekends: ['sat', 'sun'], firstDayOfWeek: 'sun'
```

当 `gregorian` 为 `true` 时，所有格式化均使用公历。当 `gregorian` 为 `false` 时，使用 `CALENDAR_MAP` 中对应的 locale 历法，未映射时回退到公历。
