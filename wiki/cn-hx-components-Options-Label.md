# HxOptionsLabel

展示组件:把绑定的值(单值或数组)解析为选项标签。使用与 `HxSelect` 相同的选项管道(静态数组或同步/异步函数)。渲染 `<span>`。

```tsx
// 静态选项,单值 -> 'Odd'
<HxOptionsLabel $model={model} $field="value"
                options={[{value: 1, label: 'Odd'}, {value: 2, label: 'Even'}]}/>

// 数组值以逗号连接 -> 'Design,Marketing'
<HxOptionsLabel $model={model} $field="departments" options={departmentOptions}/>

// 异步选项在解析完成前显示 loading 状态
<HxOptionsLabel $model={model} $field="value" options={fetchOptions}/>
```

匹配到的选项渲染 `option.selectedLabel ?? option.label`。值匹配为宽松相等(`==`),数字模型值可匹配数字选项值。匹配到的值同时镜像到 `data-hx-options-label-value` 属性上。

## 状态(`data-hx-options-label-state`)

| 状态 | 条件 | 内容 |
|------|------|------|
| `loading` | 选项尚未解析完成 | `optionsOnLoadKey` |
| `no-options` | 选项解析结果为空数组 | `noOptionsKey` |
| `no-value` | 绑定值为 null/undefined | 空 |
| `option-found` | 单值匹配,或数组值全部匹配 | 匹配的标签,数组以 `,` 连接 |
| `some-option-not-found` | 数组部分匹配 | 仅显示匹配的标签,缺失值跳过 |
| `option-not-found` | 单值未匹配,或数组全部未匹配 | `optionNotFoundKey`(单值)/ 空(数组) |

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型(必填) |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 要展示的值的路径 |
| `options` | `HxSelectOptions<T>` | — | 选项来源:静态数组、同步或异步函数 |
| `optionsDependsOn` | `HxDataPath \| Array<HxDataPath>` | — | 触发选项重载的模型路径 |
| `onOptionsChange` | `'none' \| 'clear' \| ((options) => HxSelectOption \| undefined)` | — | 选项变化时的值修正;`'clear'` 在值从新选项中消失时重置 |
| `optionsOnLoadKey` | `ReactNode` | `'~HxCommon.SelectOptionsOnLoad'` | loading 状态文本 |
| `noOptionsKey` | `ReactNode` | `'~HxCommon.SelectNoOptions'` | 空选项状态文本 |
| `optionNotFoundKey` | `ReactNode` | `'~HxCommon.SelectOptionNotFound'` | 未找到状态文本 |

## 全局配置

```ts
import { configHxOptionsLabel } from '@hx/components';

configHxOptionsLabel({
  optionsOnLoadKey: '~MyApp.Loading',    // 默认: '~HxCommon.SelectOptionsOnLoad'
  noOptionsKey: '~MyApp.NoOptions',      // 默认: '~HxCommon.SelectNoOptions'
  optionNotFoundKey: '~MyApp.NotFound',  // 默认: '~HxCommon.SelectOptionNotFound'
});
```
