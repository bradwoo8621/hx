# @hx/components

基于设计系统的 React 组件库，底层由 `@hx/data` (ERO) 提供响应式数据管理。

## 快速上手

```bash
pnpm add @hx/components
```

```tsx
import { HxButton, HxInput, HxFlex } from '@hx/components';
import { reactive } from '@hx/data';

const form = reactive({ username: '', password: '' });

<HxFlex direction="dir-y" gapY="md" paddingX="lg">
  <HxInput $model={form} $field="username" placeholder="用户名" />
  <HxInput $model={form} $field="password" type="password" />
  <HxButton text="登录" onClick={() => login(form)} />
</HxFlex>
```

## 组件索引

| 组件 | 页面 | 说明 |
|------|------|------|
| **表单** | | |
| Button | [→](./cn-hx-components-Button) | 操作按钮，支持颜色/变体系统 |
| Input | [→](./cn-hx-components-Input) | 文本/密码输入框，支持前后缀 |
| FormatInput | [→](./cn-hx-components-FormatInput) | 格式化数字/日期/时间输入 |
| Textarea | [→](./cn-hx-components-Textarea) | 多行文本，支持自动增高 |
| Checkbox | [→](./cn-hx-components-Checkbox) | 单选框，支持值对绑定 |
| Radio | [→](./cn-hx-components-Radio) | 单选按钮，支持取消选中 |
| MCheckbox | [→](./cn-hx-components-MCheckbox) | 多选框组 |
| MRadio | [→](./cn-hx-components-MRadio) | 单选按钮组 |
| Select | [→](./cn-hx-components-Select) | 下拉选择，支持筛选/排序/清除 |
| Upload | [→](./cn-hx-components-Upload) | 文件上传，支持进度追踪 |
| **布局** | | |
| Box | [→](./cn-hx-components-Box) | 容器，支持边框/内边距 |
| Flex | [→](./cn-hx-components-Flex) | Flexbox 弹性布局 |
| Grid | [→](./cn-hx-components-Grid) | CSS Grid 网格布局 |
| Separator | [→](./cn-hx-components-Separator) | 水平/垂直分割线 |
| PenetrableBasic | [→](./cn-hx-components-PenetrableBasic) | 语义化 HTML 封装（HxDiv, HxH1 等） |
| **展示** | | |
| Badge | [→](./cn-hx-components-Badge) | 状态标签/徽章 |
| Label | [→](./cn-hx-components-Label) | 样式文本，支持悬停/激活状态 |
| Callout | [→](./cn-hx-components-Callout) | 内联提示消息 |
| Icons | [→](./cn-hx-components-Icons) | 45 个 SVG 图标组件 |
| **遮罩层** | | |
| Overlay | [→](./cn-hx-components-Overlay) | 基于 Portal 的模态框/抽屉/提示系统 |
| Alert | [→](./cn-hx-components-Alert) | 模态警示框 |
| Toast | [→](./cn-hx-components-Toast) | 非阻塞通知 |
| Popup | [→](./cn-hx-components-Popup) | 锚点弹出层 |
| Actions | [→](./cn-hx-components-Actions) | 下拉操作菜单 |
| **结构** | | |
| Tabs | [→](./cn-hx-components-Tabs) | 标签页导航 |
| Panel | [→](./cn-hx-components-Panel) | 可折叠面板 |
| Pagination | [→](./cn-hx-components-Pagination) | 分页导航 |
| ButtonBar | [→](./cn-hx-components-ButtonBar) | 按钮栏 |
| **验证** | | |
| WithCheck | [→](./cn-hx-components-WithCheck) | 验证 HOC + 预置变体 |
| **共享** | | |
| Common | [→](./cn-hx-components-Common) | $model/$field 模式、全局配置、样式约定 |
| Hooks | [→](./cn-hx-components-Hooks) | useHxPopupContext、useHxTabs 等 |
| Utilities | [→](./cn-hx-components-Utilities) | computePaginationData、parseFileName 等 |

## 架构

- **响应式绑定** — `$model` + `$field` 模式，通过 `ERO.getValue()`/`ERO.setValue()` 实现双向绑定。`$model` 自动向下传递。
- **设计令牌驱动** — 通过 `data-*` 属性（如 `data-hx-button`、`data-hx-color`）控制样式，不涉及 CSS-in-JS。
- **全局配置** — 每个组件组暴露 `configHx*()` 函数用于设置全局默认值，渲染时读取。
- **事件驱动内部通信** — 弹窗、遮罩、标签页、上传组件内部使用 `EventEmitter` 进行跨组件通信。
