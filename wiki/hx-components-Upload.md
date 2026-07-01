# HxUpload / HxWithCheckUpload

File upload with multiple display variants, progress tracking, and image preview.

`HxWithCheckUpload` adds validation (see [WithCheck](./hx-components-WithCheck)).

## Basic Usage

```tsx
// Button-style, single file
<HxUpload
  $model={form} $field="resume"
  maxFileCount={1}
  accept={['.pdf', '.docx']}
  maxFileSize={10 * 1024 * 1024}
  upload={async (files) => { files.forEach(f => f.upload(onProgress)); }}
  download={async (file) => downloadFile(file)}
/>

// Drag-and-drop zone
<HxUpload
  $model={form} $field="docs"
  variant="dnd"
  upload={uploadFn}
  download={downloadFn}
  dndUploadKey="Drop files here"
  dndDescKey="Max 10MB per file"
/>

// Image gallery with preview
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

// Camera capture on mobile
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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |
| `color` | `HxColor` | `'primary'` | Theme colour for buttons and highlights |
| `variant` | `'solid' \| 'outline' \| 'ghost' \| 'dnd' \| 'gallery'` | `'solid'` | Display variant |
| `maxFileCount` | `number` | `Infinity` | Max files. `1` = single file mode |
| `maxFileSize` | `number` | `Infinity` | Max file size in bytes |
| `accept` | `string \| string[]` | — | MIME types (`'image/*'`) or extensions (`['.pdf', '.docx']`) |
| `capture` | `boolean \| 'environment' \| 'user'` | — | Camera capture mode on mobile |
| `read` | `(model, field) => fileData` | — | Custom data reader from model |
| `write` | `(model, field, data) => void` | — | Custom data writer to model |
| `upload` | `(files: HxUploadingFile[]) => void` | **required** | Upload handler. Must call `file.upload(progressCallback)` for each file |
| `download` | `(file) => Promise<bytes>` | **required** | Download handler for retrieving file bytes |
| `preview` | `(file) => Promise<bytes>` | — | Image preview bytes loader (gallery mode) |
| `thumbnail` | `(file) => Promise<bytes>` | — | Image thumbnail bytes loader (gallery mode) |
| `buttonUploadKey` | `ReactNode` | `'~HxCommon.ButtonUpload'` | Trigger label for button variants |
| `galleryUploadKey` | `ReactNode` | `'~HxCommon.GalleryUpload'` | Trigger label for gallery mode |
| `dndUploadKey` | `ReactNode` | `'~HxCommon.DndUpload'` | Trigger label for DnD mode |
| `dndDescKey` | `ReactNode` | — | Description text for DnD mode |

## File Types

### HxUploadFile

```ts
interface HxUploadFile {
  name: string;
  size?: number;
  mimeType?: string;
}
```

### HxUploadingFile

Extends `HxUploadFile` with upload capability:

```ts
interface HxUploadingFile extends HxUploadFile {
  upload: (callback: (percentage: number) => void) => Promise<HxUploadFile | string>;
  //                                       resolve with uploaded data, or reject with error string
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

## Variants

| Variant | Triggers |
|---------|----------|
| `solid` / `outline` / `ghost` | `UploadButton` — opens native file picker |
| `dnd` | `UploadDnd` — drag-and-drop zone with file picker fallback |
| `gallery` | `UploadItemGallery` — image thumbnail grid with full-screen `UploadItemGalleryPreview` portal (zoom, download, close with animated backdrop) |

## Sub-Components

- **`HxUploadItem`** — Individual file row with name, size, progress bar, error display, remove button
- **`UploadButton`** — Upload trigger button
- **`UploadDnd`** — Drag-and-drop zone
- **`UploadError`** — Error message display
- **`UploadGallery`** — Upload trigger for gallery mode
- **`UploadItemGallery`** — Image thumbnail grid
- **`UploadItemGalleryPreview`** — Full-screen image preview portal
- **`UploadItemList`** — File list (used in non-gallery modes)

## Native DOM Events

File input, drop zone, and gallery elements forward all standard DOM events. DnD events (`onDragEnter/Over/Leave/Drop`) are handled internally.

## Global Config

```ts
import { configHxUpload } from '@hx/components';
configHxUpload({
  color: 'primary',
  variant: 'solid',
  maxFileCount: Infinity,
  maxFileSize: Infinity,
});
```
