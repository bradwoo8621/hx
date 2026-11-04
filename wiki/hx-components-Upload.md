# HxUpload / HxWithCheckUpload

File upload with multiple display variants, progress tracking, and image preview.

In RTL direction, the gallery full-screen preview mirrors: the backdrop-to-thumbnail transition and the bottom action bar centering follow the inline-start edge of the trigger thumbnail.

`HxWithCheckUpload` adds validation (see [WithCheck](./hx-components-WithCheck)).

## Basic Usage

`upload` receives the browser `File` objects and must resolve to one `HxUploadingFile` per file. It does not upload anything itself; the component calls each returned `upload` callback.

```tsx
// Button-style, single file
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
| `variant` | `HxButtonVariant \| 'dnd' \| 'gallery'` | `'solid'` | Display variant (`solid`, `outline`, `ghost`, `link`, `dnd`, `gallery`) |
| `maxFileCount` | `number` | `Infinity` | Max files. `1` = single file mode; `<= 0` becomes `Infinity` |
| `maxFileSize` | `number` | `Infinity` | Max file size in bytes, checked per file; `<= 0` becomes `Infinity` |
| `accept` | `string \| string[]` | — | MIME types (`'image/*'`) or extensions (`['.pdf', '.docx']`) |
| `capture` | `boolean \| 'environment' \| 'user'` | — | Camera capture mode on mobile |
| `read` | `($model, $field, value, context) => HxUploadFile[]` | — | Custom model reader |
| `write` | `($model, $field, data, context) => void` | — | Custom model writer |
| `upload` | `(files: File[], $model, context) => Promise<HxUploadingFile[]>` | **required** | Builds the per-file upload handlers. The returned promise must not reject |
| `download` | `(file, $model, context) => Promise<void>` | **required** | Performs the download itself |
| `preview` | `(file, $model, context) => Promise<Uint8Array \| undefined>` | — | Full-image bytes (gallery mode) |
| `thumbnail` | `(file, $model, context) => Promise<Uint8Array \| undefined>` | — | Thumbnail bytes (gallery mode); falls back to `preview` |
| `buttonUploadKey` | `ReactNode` | `'~HxCommon.ButtonUpload'` | Trigger label for button variants |
| `galleryUploadKey` | `ReactNode` | `'~HxCommon.GalleryUpload'` | Trigger label for gallery mode |
| `dndUploadKey` | `ReactNode` | `'~HxCommon.DndUpload'` | Trigger label for DnD mode |
| `dndDescKey` | `ReactNode` | — | Description text for DnD mode |

`upload` and `download` are both required.

## File Types

### HxUploadFile

```ts
interface HxUploadFile {
  name: string;
  size?: number;   // bytes, copy it from the browser File.size
  mimeType?: string;
}
```

`size` is what the `maxFileSize` check reads. If the `upload` implementation omits it, that file is treated as unmeasured and is uploaded regardless of `maxFileSize`.

### HxUploadingFile

```ts
interface HxUploadingFile {
  details: HxUploadFile & {bytes?: Uint8Array};  // required
  upload: (callback: (percentage: number) => void) => Promise<HxUploadFile | string>;
  percentageSupport?: boolean;
  abort?: AbortController;
}
```

- `upload` resolves with the uploaded details, or with a non-empty string to show a custom per-file error. A **rejected** promise is caught and shown as the generic `'error'` message; do not reject to report a domain error.
- `percentageSupport` must be `true` for the progress callback (and the progress bar) to be active. Otherwise the callback is a no-op and no bar renders.
- `abort` is aborted when the user deletes an in-flight file.

### HxUploadedFile

```ts
interface HxUploadedFile {
  details: HxUploadFile;
}
```

#### Replacing the file details after upload

The per-file `upload` function owns the `HxUploadingFile` it belongs to, so it may rewrite `file.details` while the request runs. Whatever `file.details` points to when the upload succeeds is what gets written into the model:

```tsx
upload={async files => files.map(raw => {
  const uploading: HxUploadingFile = {
    details: {name: raw.name, size: raw.size},
    upload: async () => {
      const saved = await api.save(raw);
      // replace the local details with what the server returned
      uploading.details = {name: saved.name, size: saved.size, mimeType: saved.mimeType};
      return saved;
    }
  };
  return uploading;
})}
```

Mutating the existing `details` object in place works too; assigning a new object keeps the pre-upload details intact for code holding a reference to them.

## File Size Validation

`maxFileSize` is enforced per file, after selection:

- Every selected file enters the list, oversized ones included. Oversized files are not filtered out.
- An oversized file never starts uploading. It renders with the `fileOverMaxSizeKey` message instead of a progress bar, next to the retry and delete buttons; the retry button re-runs the same check.
- The same check runs for the initial upload and for a retry.
- In single file mode the previous file is cleared as soon as a new one is selected, so selecting an oversized replacement leaves an empty model with one errored item in the list.
- If the selection exceeds `maxFileCount`, the **whole selection is rejected** (nothing is added) with `filesOverMaxCountKey`; existing files stay.

## Variants

| Variant | Trigger |
|---------|---------|
| `solid` / `outline` / `ghost` / `link` | Button — opens the native file picker |
| `dnd` | Drag-and-drop zone with file-picker fallback |
| `gallery` | Image thumbnail grid with a full-screen preview portal (zoom, download, close with animated backdrop) |

Gallery mode requires an image `accept`; without one, `useAcceptCheck` logs a console warning/table. Supported image formats are detected from magic bytes: JPEG, PNG, GIF, WEBP, BMP, APNG, AVIF.

## Exports

The barrel exports only `HxUpload` and `HxWithCheckUpload`; the internal item/trigger components (`UploadButton`, `UploadDnd`, `UploadGallery`, `UploadItemGallery`, `UploadItemList`, `UploadItemGalleryPreview`, `UploadError`) are not public.

## Native DOM Events

File input, drop zone, and gallery elements forward standard DOM events, but the primary interaction is through the callbacks: `upload`, `download`, `preview`, `thumbnail`. DnD events are handled internally.

## Global Config

```ts
import { configHxUpload } from '@hx/components';
configHxUpload({
  color: 'primary',
  variant: 'solid',
  previewZIndex: 1000,  // min 10
  // i18n message keys used by the built-in checks and errors
  filesOverMaxCountKey: '~HxCommon.UploadOverMaxCount',
  fileOverMaxSizeKey: '~HxCommon.UploadOverMaxSize',
  fileNotAcceptableKey: '~HxCommon.UploadNotAcceptable',
  fileReadErrorKey: '~HxCommon.UploadReadFileError',
  fileUploadErrorKey: '~HxCommon.UploadError'
});
```
