# PenetrableBasic 组件

工厂函数生成的组件，封装原生 HTML 元素并支持 `$model` 自动传递。所有额外属性透传到底层 DOM 元素。

```tsx
<HxMain $model={form}>
  <HxHeader>
    <HxH1>仪表盘</HxH1>
  </HxHeader>
  <HxSection paddingX="lg">
    <HxP>欢迎回来。</HxP>
  </HxSection>
</HxMain>
```

## 公共 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型（自动传递给子组件） |

其他所有 props 透传到底层 HTML 元素，包括该元素类型的原生 DOM 事件。

## 语义元素

| 组件 | 标签 | 组件 | 标签 |
|------|------|------|------|
| `HxMain` | `<main>` | `HxNav` | `<nav>` |
| `HxHeader` | `<header>` | `HxAside` | `<aside>` |
| `HxFooter` | `<footer>` | `HxSection` | `<section>` |
| `HxArticle` | `<article>` | `HxBlockquote` | `<blockquote>` |

## 通用元素

| 组件 | 标签 | 组件 | 标签 |
|------|------|------|------|
| `HxDiv` | `<div>` | `HxSpan` | `<span>` |

## 标题元素

| 组件 | 标签 | 组件 | 标签 |
|------|------|------|------|
| `HxH1` | `<h1>` | `HxH4` | `<h4>` |
| `HxH2` | `<h2>` | `HxH5` | `<h5>` |
| `HxH3` | `<h3>` | `HxH6` | `<h6>` |

## 文本元素

| 组件 | 标签 | 组件 | 标签 |
|------|------|------|------|
| `HxP` | `<p>` | `HxPre` | `<pre>` |
| `HxCode` | `<code>` | | |

## 列表元素

| 组件 | 标签 | 组件 | 标签 |
|------|------|------|------|
| `HxUl` | `<ul>` | `HxLi` | `<li>` |
| `HxOl` | `<ol>` | `HxDl` | `<dl>` |
| `HxDd` | `<dd>` | `HxDt` | `<dt>` |

## HxFragment

传递 `$model` 给子组件但不添加 DOM 包装：

```tsx
<HxFragment $model={form}>
  <HxInput $field="name" />
  <HxInput $field="email" />
</HxFragment>
```
