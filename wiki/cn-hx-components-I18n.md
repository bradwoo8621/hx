# 国际化（i18n）

Hx 组件内置 i18n 系统，基于单例 `HxLanguageContext` 和 `~` 前缀约定。支持动态语言切换、嵌套翻译键名和自动回退。

---

## 初始化

### 安装语言包

在渲染前使用 `StdHxLanguages` 安装翻译数据：

```ts
import { StdHxLanguages, HxLanguageProvider } from '@hx/components';

// 安装语言包（可任意位置调用，支持链式调用）
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

### 用 Provider 包裹应用

```tsx
import { HxLanguageProvider } from '@hx/components';

<HxLanguageProvider>
  <App />
</HxLanguageProvider>
```

Provider 会自动从 `localStorage`（键名 `HX-LANGUAGE`）读取语言设置，回退到 `configHxContext().languageCode`（默认 `"en"`）。

---

## 全局配置

```ts
import { configHxContext } from '@hx/components';

configHxContext({
  languageCode: 'zh-CN',  // 默认语言，无已保存偏好时使用
});
```

---

## `~` 前缀约定

任何支持 i18n 的字符串 prop 使用 `~` 前缀标记为翻译键名：

```tsx
<HxButton text="~Common.Save" />              // 解析为语言包中的 Common.Save
<HxLabel text="~App.Title" />                  // 解析为 App.Title
<HxBadge text="~Status.Active" color="success" />
```

要显示字面量 `~` 字符，用 `\` 转义：

```tsx
<HxLabel text="\~普通文本" />  // 显示 "~普通文本"，不会作为 i18n 解析
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

## 支持 i18n 的组件

### 文本/Label Props（自动解析）

以下 props 自动解析 `~` 前缀字符串：

| 组件 | Prop | 备注 |
|------|------|------|
| Button | `text` | 字符串时始终按 i18n 处理（即使没有 `~` 前缀） |
| Label | `text` | `~` 前缀触发 i18n 解析 |
| Badge | `text` | 同 Label |

### 响应式 i18n（`valueUseI18N`）

当指定了 `$field` 且模型值需要翻译时：

```tsx
// model.status 包含 i18n 键名，如 "Status.Active"
<HxButton $model={form} $field="status" valueUseI18N />
<HxLabel $model={form} $field="status" valueUseI18N />
<HxBadge $model={form} $field="status" valueUseI18N />
```

`valueUseI18N` 在直接使用 `text`（非 `$field` 模式）时不生效。

### Select 选项标签

`HxSelect`、`HxMCheckbox`、`HxMRadio` 的选项 label 内部渲染为 `HxLabel`，`~` 前缀标签自动解析：

```tsx
const options = [
  { value: 'active', label: '~Status.Active' },
  { value: 'inactive', label: '~Status.Inactive' },
];
```

### 可自定义的 i18n 键名

部分组件暴露 i18n 键名 prop 用于自定义内置标签：

**Select**：

| Prop | 默认键名 | 默认中文（需自建） |
|------|---------|-------------------|
| `placeholder` | `HxCommon.SelectPlaceholder` | "Please select..." |
| `filterPlaceholderKey` | `HxCommon.SelectFilterPlaceholder` | "Filter..." |
| `optionsOnLoadKey` | `HxCommon.SelectOptionsOnLoad` | "Options on loading..." |
| `noOptionsKey` | `HxCommon.SelectNoOptions` | "No options" |

**Upload**：

| Prop | 默认键名 | 默认中文（需自建） |
|------|---------|-------------------|
| `buttonUploadKey` | `HxCommon.ButtonUpload` | "Upload" |
| `galleryUploadKey` | `HxCommon.GalleryUpload` | "Upload" |
| `dndUploadKey` | `HxCommon.DndUpload` | "Click or drag file to this area to upload" |
| `dndDescKey` | — | — |

**Pagination**：

| 标签 | 默认键名 |
|------|---------|
| 每页 | `HxCommon.PerPage` ("/ Page") |
| 总数 | `HxCommon.TotalItems1` ("Total") + `HxCommon.TotalItems2` ("Items") |

**Alert 对话框按钮**：

| 按钮 | 默认键名 | 默认英文 |
|------|---------|----------|
| 确定 | `HxCommon.OkButton` | "Ok" |
| 取消 | `HxCommon.CancelButton` | "Cancel" |
| 放弃 | `HxCommon.DiscardButton` | "Discard" |
| 关闭 | `HxCommon.CloseButton` | "Close" |
| 关闭（Toast） | `HxCommon.DismissButton` | "Dismiss" |
| 是 | `HxCommon.YesButton` | "Yes" |
| 否 | `HxCommon.NoButton` | "No" |

**Upload 错误消息**：

| 错误 | 默认键名 | 默认英文 |
|------|---------|----------|
| 超大小 | `HxCommon.UploadOverMaxSize` | "Over max file size." |
| 超数量 | `HxCommon.UploadOverMaxCount` | "Over max file count, ignored." |
| 类型不符 | `HxCommon.UploadNotAcceptable` | "File type not acceptable." |
| 读取失败 | `HxCommon.UploadReadFileError` | "Failed to read file, ignored." |
| 上传失败 | `HxCommon.UploadError` | "Upload failed." |

### 覆盖内置键名

在语言包中包含对应键名即可覆盖：

```ts
StdHxLanguages.install('zh-CN', {
  HxCommon: {
    OkButton: '确认',
    CancelButton: '返回',
    SelectPlaceholder: '请选择...',
    ButtonUpload: '添加文件',
  },
});
```

也可以直接在组件 prop 上传入自定义字符串：

```tsx
<HxSelect placeholder="请选择..." />
<HxUpload buttonUploadKey="添加文件" />
<HxUpload buttonUploadKey="~MyApp.UploadLabel" />  // 也可使用自己的 i18n 键名
```

---

## 语言切换

### 编程式切换

```ts
import { HxLanguageContext } from '@hx/components';

HxLanguageContext.switchTo('zh-CN');
```

所有组件将以新语言重新渲染。偏好设置持久化到 `localStorage`（键名 `HX-LANGUAGE`）。根元素上的 `data-hx-language` 属性自动更新。

### 使用 Hook

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

`useHxLanguage()` 返回值：

| 方法 | 说明 |
|------|------|
| `switchTo(code)` | 切换到指定语言代码 |
| `current()` | 获取当前语言代码 |
| `get(key)` | 获取键名对应的翻译（支持嵌套路径，如 `"Common.Save"`） |
| `on(listener)` | 注册语言变更监听器 |
| `off(listener)` | 移除语言变更监听器 |

### 监听语言变更

```ts
import { HxLanguageContext } from '@hx/components';

const listener = (languageCode, type) => {
  console.log(`语言切换为 ${languageCode}（${type}）`);
  // type 为 'language-code-change' 或 'languages-change'
};
HxLanguageContext.on(listener);

// 记得清理
HxLanguageContext.off(listener);
```

---

## 语言回退

当翻译键名在当前语言包中找不到时，系统自动回退：

1. 尝试精确语言代码（如 `"zh-CN"`）
2. 尝试父语言（如 `"zh"`）
3. 尝试默认语言（来自 `configHxContext`）
4. 返回键名本身作为显示值

这意味着只需为实际支持的语言提供翻译。缺失的键名会显示其键名本身，便于识别。

---

## Data Attributes

| 属性 | 设置位置 | 值 |
|------|---------|-----|
| `data-hx-language` | `[data-hx-root]`、`[data-hx-portal-root]` | 当前语言代码（如 `"zh-CN"`） |

可用于语言特定的 CSS：

```css
[data-hx-language="zh-CN"] [data-hx-button] {
  /* 中文环境下的按钮样式 */
}
```
