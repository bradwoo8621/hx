# Internationalization (i18n)

Hx components have a built-in i18n system based on a singleton `HxLanguageContext` and the `~` prefix convention. It supports dynamic language switching, nested translation keys, and automatic fallback.

---

## Setup

### Install Language Packs

Use `StdHxLanguages` to install translation data before rendering:

```ts
import { StdHxLanguages, HxLanguageProvider } from '@hx/components';

// Install language packs (can be called anywhere, supports chaining)
StdHxLanguages.create({
  en: {
    Common: {
      Save: 'Save',
      Cancel: 'Cancel',
      Delete: 'Delete',
    },
    App: {
      Title: 'My Application',
      Welcome: 'Welcome, {name}',
    },
  },
  'zh-CN': {
    Common: {
      Save: '保存',
      Cancel: '取消',
      Delete: '删除',
    },
    App: {
      Title: '我的应用',
      Welcome: '欢迎，{name}',
    },
  },
});
```

### Wrap App with Provider

```tsx
import { HxLanguageProvider } from '@hx/components';

<HxLanguageProvider>
  <App />
</HxLanguageProvider>
```

The provider automatically initializes the language from `localStorage` (key `HX-LANGUAGE`), falling back to `configHxContext().languageCode` (default `"en"`).

---

## Global Config

```ts
import { configHxContext } from '@hx/components';

configHxContext({
  languageCode: 'zh-CN',  // default language, used when no saved preference
});
```

---

## The `~` Prefix Convention

Any string prop that accepts i18n content uses the `~` prefix to mark it as a translation key:

```tsx
<HxButton text="~Common.Save" />              // resolved to language pack's Common.Save
<HxLabel text="~App.Title" />                  // resolved to App.Title
<HxBadge text="~Status.Active" color="success" />
```

To display a literal `~` character, escape it with `\`:

```tsx
<HxLabel text="\~literal text" />  // displays "~literal text", not resolved as i18n
```

### `I18NUtils`

```ts
import { I18NUtils } from '@hx/components';

I18NUtils.isI18NKey('~Common.Save');  // [true, 'Common.Save']
I18NUtils.isI18NKey('\~text');        // [false, '~text']
I18NUtils.isI18NKey('plain');         // [false, 'plain']

I18NUtils.addI18NPrefix('Common.Save');  // '~Common.Save'
I18NUtils.delI18NPrefix('~Common.Save'); // 'Common.Save'
```

---

## Components with i18n Support

### Text/Label Props (auto-resolve)

These props automatically resolve `~`-prefixed strings:

| Component | Prop | Notes |
|-----------|------|-------|
| Button | `text` | Always treated as i18n when it's a string (even without `~` prefix) |
| Label | `text` | `~` prefix triggers i18n resolution |
| Badge | `text` | Same as Label |

### Reactive i18n (`valueUseI18N`)

When `$field` is specified and the model value needs translation:

```tsx
// model.status contains an i18n key like "Status.Active"
<HxButton $model={form} $field="status" valueUseI18N />
<HxLabel $model={form} $field="status" valueUseI18N />
<HxBadge $model={form} $field="status" valueUseI18N />
```

`valueUseI18N` has no effect when `text` is used directly (without `$field`).

### Select Options Labels

Option labels in `HxSelect`, `HxMCheckbox`, `HxMRadio` are rendered as `HxLabel` internally, so `~`-prefixed labels are automatically resolved:

```tsx
const options = [
  { value: 'active', label: '~Status.Active' },
  { value: 'inactive', label: '~Status.Inactive' },
];
```

### Customizable i18n Keys

Some components expose i18n key props for customizing built-in labels:

**Select**:

| Prop | Default Key | Default English |
|------|-------------|-----------------|
| `placeholder` | `HxCommon.SelectPlaceholder` | "Please select..." |
| `filterPlaceholderKey` | `HxCommon.SelectFilterPlaceholder` | "Filter..." |
| `optionsOnLoadKey` | `HxCommon.SelectOptionsOnLoad` | "Options on loading..." |
| `noOptionsKey` | `HxCommon.SelectNoOptions` | "No options" |

**Upload**:

| Prop | Default Key | Default English |
|------|-------------|-----------------|
| `buttonUploadKey` | `HxCommon.ButtonUpload` | "Upload" |
| `galleryUploadKey` | `HxCommon.GalleryUpload` | "Upload" |
| `dndUploadKey` | `HxCommon.DndUpload` | "Click or drag file to this area to upload" |
| `dndDescKey` | — | — |

**Pagination**:

| Label | Default Keys |
|-------|--------------|
| Per page | `HxCommon.PerPage` ("/ Page") |
| Total items | `HxCommon.TotalItems1` ("Total") + `HxCommon.TotalItems2` ("Items") |

**Alert Dialog Buttons**:

| Button | Default Key | Default English |
|--------|-------------|-----------------|
| OK | `HxCommon.OkButton` | "Ok" |
| Cancel | `HxCommon.CancelButton` | "Cancel" |
| Discard | `HxCommon.DiscardButton` | "Discard" |
| Close | `HxCommon.CloseButton` | "Close" |
| Dismiss (Toast) | `HxCommon.DismissButton` | "Dismiss" |
| Yes | `HxCommon.YesButton` | "Yes" |
| No | `HxCommon.NoButton` | "No" |

**Upload Error Messages**:

| Error | Default Key | Default English |
|-------|-------------|-----------------|
| Over max size | `HxCommon.UploadOverMaxSize` | "Over max file size." |
| Over max count | `HxCommon.UploadOverMaxCount` | "Over max file count, ignored." |
| Not acceptable | `HxCommon.UploadNotAcceptable` | "File type not acceptable." |
| Read error | `HxCommon.UploadReadFileError` | "Failed to read file, ignored." |
| Upload failed | `HxCommon.UploadError` | "Upload failed." |

### Overriding Built-in Keys

To customize any built-in label, include the corresponding key in your language pack:

```ts
StdHxLanguages.install('en', {
  HxCommon: {
    OkButton: 'Confirm',
    CancelButton: 'Go Back',
    SelectPlaceholder: 'Choose an option...',
    ButtonUpload: 'Add File',
  },
});
```

Alternatively, pass a custom string directly to the component prop:

```tsx
<HxSelect placeholder="Pick one..." />                         // plain string
<HxUpload buttonUploadKey="Add Files" />                       // plain string
<HxUpload buttonUploadKey="~MyApp.UploadLabel" />              // i18n key
```

---

## Language Switching

### Programmatic Switch

```ts
import { HxLanguageContext } from '@hx/components';

HxLanguageContext.switchTo('zh-CN');
```

All components re-render with the new language. The preference is persisted to `localStorage` (key `HX-LANGUAGE`). The `data-hx-language` attribute on root elements is updated automatically.

### Using the Hook

```tsx
import { useHxLanguage } from '@hx/components';

function LanguageSwitcher() {
  const lang = useHxLanguage();

  return (
    <select
      value={lang.current()}
      onChange={(e) => lang.switchTo(e.target.value)}
    >
      <option value="en">English</option>
      <option value="zh-CN">中文</option>
    </select>
  );
}
```

`useHxLanguage()` returns:

| Method | Description |
|--------|-------------|
| `switchTo(code)` | Switch to the given language code |
| `current()` | Get the current language code |
| `get(key)` | Get translated content for a key (supports nested paths like `"Common.Save"`) |
| `on(listener)` | Register a language change listener |
| `off(listener)` | Remove a language change listener |

### Listening for Language Changes

```ts
import { HxLanguageContext } from '@hx/components';

HxLanguageContext.on((languageCode, type) => {
  console.log(`Language changed to ${languageCode} (${type})`);
  // type is 'language-code-change' or 'languages-change'
});

// Remember to clean up
HxLanguageContext.off(listener);
```

---

## Language Fallback

When a translation key is not found in the current language pack, the system automatically falls back:

1. Try the exact language code (e.g., `"zh-CN"`)
2. Try the parent language (e.g., `"zh"`)
3. Try the default language (from `configHxContext`)
4. Return the key itself as the display value

This means you only need to provide translations for languages you actively support. Missing keys will show their key names as a visible indicator.

---

## Data Attributes

| Attribute | Set on | Value |
|-----------|--------|-------|
| `data-hx-language` | `[data-hx-root]`, `[data-hx-portal-root]` | Current language code (e.g., `"zh-CN"`) |

Use this for language-specific CSS:

```css
[data-hx-language="zh-CN"] [data-hx-button] {
  /* Chinese-specific button styles */
}
```
