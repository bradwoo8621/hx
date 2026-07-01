# HxPopup / HxPopupProvider

锚定到触发元素的弹出层。自动检测视口边界——优先在触发器下方弹出，必要时回退到上方。

```tsx
<HxPopupProvider zIndex={2000} gapToEdge={5}>
  <HxButton text="打开菜单" />
  <HxPopup>
    <HxFlex direction="dir-y">
      <HxButton text="编辑" variant="ghost" onClick={edit} />
      <HxButton text="删除" variant="ghost" color="danger" onClick={del} />
    </HxFlex>
  </HxPopup>
</HxPopupProvider>

// 匹配触发器宽度
<HxPopupProvider sameWidthAtMinimum>
  <HxInput $model={form} $field="search" />
  <HxPopup>
    {/* 弹出层宽度 >= 输入框宽度 */}
  </HxPopup>
</HxPopupProvider>
```

## Props（通过 HxPopupProvider）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `zIndex` | `number` | `2000` | CSS z-index |
| `gapToEdge` | `number` | `5` | 触发器与弹出层间距（像素） |
| `sameWidthAtMinimum` | `boolean` | — | 弹出层最小宽度等于触发器宽度 |

## 生命周期状态机

```
hidden → prepare → prepared → active → hide → hidden
```

## Hook

`useHxPopupContext()`——在弹出层内容中访问：

```ts
const { show, hide, toggle, isVisible } = useHxPopupContext();
```

## 全局配置

```ts
import { configHxPopup } from '@hx/components';
configHxPopup({ zIndex: 2000, gapToEdge: 5 });
```
