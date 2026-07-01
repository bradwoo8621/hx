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
