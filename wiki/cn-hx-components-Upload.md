# HxUpload / HxWithCheckUpload

文件上传组件，支持多种展示变体、进度跟踪和图片预览。

RTL 方向下画廊全屏预览会镜像：背景到缩略图的过渡动画与底部操作栏的居中均以触发缩略图的行首边缘为基准。

`HxWithCheckUpload` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

## 基本用法

```tsx
// 按钮样式，单文件
<HxUpload
  $model={form} $field="resume"
  maxFileCount={1}
  accept={['.pdf', '.docx']}
  maxFileSize={10 * 1024 * 1024}
  upload={async (files) => { files.forEach(f => f.upload(onProgress)); }}
  download={async (file) => downloadFile(file)}
/>

// 拖拽上传区域
<HxUpload
  $model={form} $field="docs"
  variant="dnd"
  upload={uploadFn}
  download={downloadFn}
  dndUploadKey="拖拽文件到此处"
  dndDescKey="每个文件最大 10MB"
/>

// 图片画廊带预览
<HxUpload
  $model={form} $field="photos"
  variant="gallery"
  accept="image/*"
  maxFileCount={5}
  upload={uploadFn}
  download={downloadFn}
  preview={async (file) => fetchFullImage(file)}
  thumbnail={async (file) => fetchThumbnail(file)}
/>

// 移动端相机拍摄
<HxUpload
  $model={form} $field="idPhoto"
  maxFileCount={1}
  capture="environment"
  accept="image/*"
  upload={uploadFn}
  download={downloadFn}
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |
| `color` | `HxColor` | `'primary'` | 按钮和高亮的主题色 |
| `variant` | `'solid' \| 'outline' \| 'ghost' \| 'dnd' \| 'gallery'` | `'solid'` | 展示变体 |
| `maxFileCount` | `number` | `Infinity` | 最大文件数。`1` = 单文件模式 |
| `maxFileSize` | `number` | `Infinity` | 最大文件大小（字节），按文件逐个校验（参见[文件大小校验](#文件大小校验)） |
| `accept` | `string \| string[]` | — | MIME 类型（`'image/*'`）或扩展名（`['.pdf', '.docx']`） |
| `capture` | `boolean \| 'environment' \| 'user'` | — | 移动端相机拍摄模式 |
| `read` | `(model, field) => fileData` | — | 自定义模型读取函数 |
| `write` | `(model, field, data) => void` | — | 自定义模型写入函数 |
| `upload` | `(files: HxUploadingFile[]) => void` | **必填** | 上传处理函数。须为每个文件调用 `file.upload(progressCallback)` |
| `download` | `(file) => Promise<bytes>` | **必填** | 下载处理函数，用于获取文件字节 |
| `preview` | `(file) => Promise<bytes>` | — | 图片预览字节加载器（画廊模式） |
| `thumbnail` | `(file) => Promise<bytes>` | — | 图片缩略图字节加载器（画廊模式） |
| `buttonUploadKey` | `ReactNode` | `'~HxCommon.ButtonUpload'` | 按钮变体的触发器标签 |
| `galleryUploadKey` | `ReactNode` | `'~HxCommon.GalleryUpload'` | 画廊模式的触发器标签 |
| `dndUploadKey` | `ReactNode` | `'~HxCommon.DndUpload'` | 拖拽模式的触发器标签 |
| `dndDescKey` | `ReactNode` | — | 拖拽模式的描述文本 |

## 文件类型

### HxUploadFile

```ts
interface HxUploadFile {
  name: string;
  size?: number; // 字节数，须从浏览器 File.size 复制
  mimeType?: string;
}
```

`size` 是 `maxFileSize` 校验的依据。若 `upload` prop 的实现没有填它，该文件会被视为无法测量大小，从而绕过 `maxFileSize` 直接上传。

### HxUploadingFile

继承 `HxUploadFile`，附加上传能力：

```ts
interface HxUploadingFile extends HxUploadFile {
  upload: (callback: (percentage: number) => void) => Promise<HxUploadFile | string>;
  //                                       成功返回文件数据，失败返回错误信息字符串
  percentageSupport?: boolean;
  abort?: AbortController;
}
```

### HxUploadFileFunc

```ts
type HxUploadFileFunc = (
  callback: (percentage: number) => void
) => Promise<HxUploadFile | string>;
```

## 文件大小校验

`maxFileSize` 在文件选中后按文件逐个校验：

- 选中的文件一律进入列表，超限的也不会被过滤掉。
- 超限文件不会开始上传，而是以 `fileOverMaxSizeKey` 消息代替进度条显示，旁边是重试和删除按钮；点重试会重新走同一校验。
- 首次上传和重试共用同一校验，两条路径都无法把超限文件传上去。
- 单文件模式下，选中新文件时会先清空旧文件，因此选中一个超限的替换文件后，模型为空、列表里只剩一个报错项。

## 变体

| 变体 | 触发器 |
|------|--------|
| `solid` / `outline` / `ghost` | `UploadButton`——打开原生文件选择器 |
| `dnd` | `UploadDnd`——拖拽区域，含文件选择器回退 |
| `gallery` | `UploadItemGallery`——图片缩略图网格，带全屏 `UploadItemGalleryPreview` 弹窗（缩放、下载、关闭带动画背景过渡） |

## 子组件

- **`HxUploadItem`** — 单个文件行，显示名称、大小、进度条、错误、删除按钮
- **`UploadButton`** — 上传触发按钮
- **`UploadDnd`** — 拖拽区域
- **`UploadError`** — 错误信息展示
- **`UploadGallery`** — 画廊模式上传触发器
- **`UploadItemGallery`** — 图片缩略图网格
- **`UploadItemGalleryPreview`** — 全屏图片预览弹窗
- **`UploadItemList`** — 文件列表（非画廊模式）

## 原生 DOM 事件

文件输入框、拖拽区域和画廊元素转发所有标准 DOM 事件，但实际不需要——主交互通过回调完成：`upload`、`download`、`preview`、`thumbnail`。拖拽事件（`onDragEnter`、`onDragOver`、`onDragLeave`、`onDrop`）由 `UploadDnd` 内部处理。

## 全局配置

```ts
import { configHxUpload } from '@hx/components';
configHxUpload({
  color: 'primary',
  variant: 'solid',
  // 内置校验与错误使用的 i18n 消息 key
  filesOverMaxCountKey: '~HxCommon.UploadOverMaxCount', // 超出文件数量
  fileOverMaxSizeKey: '~HxCommon.UploadOverMaxSize', // 文件超出大小上限
  fileNotAcceptableKey: '~HxCommon.UploadNotAcceptable', // 文件类型不可接受
  fileReadErrorKey: '~HxCommon.UploadReadFileError', // 读取选中文件失败
  fileUploadErrorKey: '~HxCommon.UploadError', // 通用上传错误
});
```

这些消息 key 可配置，便于替换成应用自己的 key。消息渲染和画廊模式的错误展示都基于配置后的值进行比较。
