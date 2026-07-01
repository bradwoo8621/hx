# Icons

45 个 SVG 图标组件。所有图标尺寸为 `15×15`，`viewBox="0 0 15 15"`，`fill="none"`，路径使用 `fill="currentColor"` 继承父元素颜色。

## 引入方式

```tsx
// 具名导入
import { Calendar, Check, MagnifyingGlass, Trash } from '@hx/components';

// 命名空间导入
import { Icons } from '@hx/components';
// <Icons.Calendar />  <Icons.Check />
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `marginT` | `number` | — | 顶部外边距（像素） |
| `marginR` | `number` | — | 右侧外边距（像素） |
| `marginB` | `number` | — | 底部外边距（像素） |
| `marginL` | `number` | — | 左侧外边距（像素） |
| `style` | `CSSProperties` | — | SVG 元素的内联样式 |
| `data-hx-*` | `string \| number \| boolean` | — | 用于设计令牌样式的自定义 data 属性 |

## 用法

```tsx
// 作为按钮文本内的图标（继承按钮颜色）
<HxButton text={<><Plus marginR={4} />添加项目</>} />

// 独立使用带样式
<Check style={{ color: 'green' }} marginR={8} />

// 输入框前缀（搜索图标）
<HxInput prefix={<MagnifyingGlass />} />
```

## 图标目录

| 名称 | 类别 | 名称 | 类别 |
|------|------|------|------|
| `Archive` | 操作 | `Calendar` | 数据 |
| `CaretDown` | 导航 | `CaretLeft` | 导航 |
| `CaretRight` | 导航 | `CaretUp` | 导航 |
| `Check` | 状态 | `ChevronDown` | 导航 |
| `ChevronLeft` | 导航 | `ChevronRight` | 导航 |
| `ChevronUp` | 导航 | `Clear` | 操作 |
| `Clock` | 数据 | `Close` | 操作 |
| `Collapse` | 操作 | `Cross1` | 操作 |
| `DotsX` | 操作（水平） | `DotsY` | 操作（垂直） |
| `Download` | 操作 | `Error` | 状态 |
| `Exclamation` | 状态 | `Expand` | 操作 |
| `EyeClosed` | 开关 | `EyeNone` | 开关 |
| `EyeOpen` | 开关 | `FileText` | 文件 |
| `House` | 导航 | `Info` | 状态 |
| `LinkBreak` | 操作 | `Link2` | 操作 |
| `MagnifyingGlass` | 操作 | `Margin` | 布局 |
| `Minus` | 数学 | `Plus` | 数学 |
| `Question` | 状态 | `Success` | 状态 |
| `Trash` | 操作 | `TriangleDown` | 导航 |
| `TriangleLeft` | 导航 | `TriangleRight` | 导航 |
| `TriangleUp` | 导航 | `Update` | 操作 |
| `Upload` | 操作 | `ZoomIn` | 操作 |
| `ZoomOut` | 操作 | | |

## 原生 DOM 事件

所有标准 `<svg>` 事件透传。Icon 通常是纯展示元素，作为交互元素时最有用的是 `onClick`。
