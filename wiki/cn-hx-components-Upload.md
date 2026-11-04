# HxUpload / HxWithCheckUpload

文件上传组件，支持多种展示变体、进度跟踪和图片预览。

RTL 方向下画廊全屏预览会镜像：背景到缩略图的过渡动画与底部操作栏的居中均以触发缩略图的行首边缘为基准。

`HxWithCheckUpload` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

## 基本用法

`upload` 接收浏览器 `File` 对象，必须为每个文件返回一个 `HxUploadingFile`。它本身不执行上传；组件会调用返回的每个 `upload` 回调。

```tsx
// 按钮样式，单文件
<HxUpload
  $model={form} $field="resume"
  maxFileCount={1}
  accept={['.pdf', '.docx']}
  maxFileSize={10 * 1024 * 1024}
  upload={async files => files.map(raw => ({
    details: {name: raw.name, size: raw.size},
    percentageSupport: true,
    upload: async onProgress => api.upload(raw, onProgress)
  }))}
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
| `variant` | `HxButtonVariant \| 'dnd' \| 'gallery'` | `'solid'` | 展示变体（`solid`、`outline`、`ghost`、`link`、`dnd`、`gallery`） |
| `maxFileCount` | `number` | `Infinity` | 最大文件数。`1` = 单文件模式；`<= 0` 视为 `Infinity` |
| `maxFileSize` | `number` | `Infinity` | 最大文件大小（字节），按文件逐个校验；`<= 0` 视为 `Infinity` |
| `accept` | `string \| string[]` | — | MIME 类型（`'image/*'`）或扩展名（`['.pdf', '.docx']`） |
| `capture` | `boolean \| 'environment' \| 'user'` | — | 移动端相机拍摄模式 |
| `read` | `($model, $field, value, context) => HxUploadFile[]` | — | 自定义模型读取函数 |
| `write` | `($model, $field, data, context) => void` | — | 自定义模型写入函数 |
| `upload` | `(files: File[], $model, context) => Promise<HxUploadingFile[]>` | **必填** | 为每个文件构造上传处理器。返回的 Promise 不能 reject |
| `download` | `(file, $model, context) => Promise<void>` | **必填** | 自行完成下载 |
| `preview` | `(file, $model, context) => Promise<Uint8Array \| undefined>` | — | 全尺寸图片字节（画廊模式） |
| `thumbnail` | `(file, $model, context) => Promise<Uint8Array \| undefined>` | — | 缩略图字节（画廊模式）；省略时回退到 `preview` |
| `buttonUploadKey` | `ReactNode` | `'~HxCommon.ButtonUpload'` | 按钮变体的触发器标签 |
| `galleryUploadKey` | `ReactNode` | `'~HxCommon.GalleryUpload'` | 画廊模式的触发器标签 |
| `dndUploadKey` | `ReactNode` | `'~HxCommon.DndUpload'` | 拖拽模式的触发器标签 |
| `dndDescKey` | `ReactNode` | — | 拖拽模式的描述文本 |

`upload` 与 `download` 都是必填。

## 文件类型

### HxUploadFile

```ts
interface HxUploadFile {
  name: string;
  size?: number;   // 字节数，须从浏览器 File.size 复制
  mimeType?: string;
}
```

`size` 是 `maxFileSize` 校验的依据。若 `upload` 的实现没有填它，该文件会被视为无法测量大小，从而绕过 `maxFileSize` 直接上传。

### HxUploadingFile

```ts
interface HxUploadingFile {
  details: HxUploadFile & {bytes?: Uint8Array};  // 必填
  upload: (callback: (percentage: number) => void) => Promise<HxUploadFile | string>;
  percentageSupport?: boolean;
  abort?: AbortController;
}
```

- `upload` 成功时返回上传后的详情；返回非空字符串表示显示自定义的单文件错误。**被 reject** 的 Promise 会被捕获并显示通用 `'error'` 消息；不要用 reject 表达业务错误。
- `percentageSupport` 必须为 `true`，进度回调（和进度条）才会生效；否则回调是空操作，也不渲染进度条。
- 删除正在上传的文件时，会 abort `abort` 控制器。

### HxUploadedFile

```ts
interface HxUploadedFile {
  details: HxUploadFile;
}
```

#### 上传完成后替换文件详情

每个文件的 `upload` 函数可以持有它所属的 `HxUploadingFile`，因此可以在请求过程中改写 `file.details`。上传成功那一刻 `file.details` 指向的内容就是写入模型的内容：

```tsx
upload={async (files) => files.map(raw => {
  const uploading: HxUploadingFile = {
    details: {name: raw.name, size: raw.size},
    upload: async () => {
      const saved = await api.save(raw);
      // 用服务端返回的内容替换本地详情
      uploading.details = {name: saved.name, size: saved.size, mimeType: saved.mimeType};
      return saved;
    }
  };
  return uploading;
})}
```

原地修改 `details` 对象也可以；赋一个新对象会保留上传前的详情，供仍持有旧引用的代码使用。

## 文件大小校验

`maxFileSize` 在文件选中后按文件逐个校验：

- 选中的文件一律进入列表，超限的也不会被过滤掉。
- 超限文件不会开始上传，而是以 `fileOverMaxSizeKey` 消息代替进度条显示，旁边是重试和删除按钮；点重试会重新走同一校验。
- 首次上传和重试共用同一校验，两条路径都无法把超限文件传上去。
- 单文件模式下，选中新文件时会先清空旧文件，因此选中一个超限的替换文件后，模型为空、列表里只剩一个报错项。
- 选择数量超过 `maxFileCount` 时，**整个选择被拒绝**（不添加任何文件），并显示 `filesOverMaxCountKey`；已有文件保持不变。

## 变体

| 变体 | 触发器 |
|------|--------|
| `solid` / `outline` / `ghost` / `link` | 按钮——打开原生文件选择器 |
| `dnd` | 拖拽区域，含文件选择器回退 |
| `gallery` | 图片缩略图网格，带全屏预览弹窗（缩放、下载、关闭带动画背景过渡） |

画廊模式要求图片 `accept`；缺失时 `useAcceptCheck` 会打印控制台警告/表格。支持的图片格式通过魔数检测：JPEG、PNG、GIF、WEBP、BMP、APNG、AVIF。

## 导出

包入口只导出 `HxUpload` 和 `HxWithCheckUpload`；内部的 item/trigger 组件（`UploadButton`、`UploadDnd`、`UploadGallery`、`UploadItemGallery`、`UploadItemList`、`UploadItemGalleryPreview`、`UploadError`）不是公共 API。

## 原生 DOM 事件

文件输入框、拖拽区域和画廊元素转发标准 DOM 事件，但主交互通过回调完成：`upload`、`download`、`preview`、`thumbnail`。拖拽事件由组件内部处理。

## 全局配置

```ts
import { configHxUpload } from '@hx/components';
configHxUpload({
  color: 'primary',
  variant: 'solid',
  previewZIndex: 1000,  // 最低 10
  // 内置校验与错误使用的 i18n 消息 key
  filesOverMaxCountKey: '~HxCommon.UploadOverMaxCount',
  fileOverMaxSizeKey: '~HxCommon.UploadOverMaxSize',
  fileNotAcceptableKey: '~HxCommon.UploadNotAcceptable',
  fileReadErrorKey: '~HxCommon.UploadReadFileError',
  fileUploadErrorKey: '~HxCommon.UploadError'
});
```
