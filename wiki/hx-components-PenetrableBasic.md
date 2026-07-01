# PenetrableBasic Components

Factory-generated components wrapping native HTML elements with `$model` auto-propagation. All extra attributes are spread onto the underlying DOM element.

```tsx
<HxMain $model={form}>
  <HxHeader>
    <HxH1>Dashboard</HxH1>
  </HxHeader>
  <HxSection paddingX="lg">
    <HxP>Welcome back.</HxP>
  </HxSection>
</HxMain>
```

## Common Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model (auto-propagated to children) |

All other props are forwarded to the underlying HTML element, including native DOM events for that element type.

## Semantic Elements

| Component | Tag | Component | Tag |
|-----------|-----|-----------|-----|
| `HxMain` | `<main>` | `HxNav` | `<nav>` |
| `HxHeader` | `<header>` | `HxAside` | `<aside>` |
| `HxFooter` | `<footer>` | `HxSection` | `<section>` |
| `HxArticle` | `<article>` | `HxBlockquote` | `<blockquote>` |

## Generic Elements

| Component | Tag | Component | Tag |
|-----------|-----|-----------|-----|
| `HxDiv` | `<div>` | `HxSpan` | `<span>` |

## Heading Elements

| Component | Tag | Component | Tag |
|-----------|-----|-----------|-----|
| `HxH1` | `<h1>` | `HxH4` | `<h4>` |
| `HxH2` | `<h2>` | `HxH5` | `<h5>` |
| `HxH3` | `<h3>` | `HxH6` | `<h6>` |

## Text Elements

| Component | Tag | Component | Tag |
|-----------|-----|-----------|-----|
| `HxP` | `<p>` | `HxPre` | `<pre>` |
| `HxCode` | `<code>` | | |

## List Elements

| Component | Tag | Component | Tag |
|-----------|-----|-----------|-----|
| `HxUl` | `<ul>` | `HxLi` | `<li>` |
| `HxOl` | `<ol>` | `HxDl` | `<dl>` |
| `HxDd` | `<dd>` | `HxDt` | `<dt>` |

## HxFragment

Propagates `$model` to children without adding a DOM wrapper:

```tsx
<HxFragment $model={form}>
  <HxInput $field="name" />
  <HxInput $field="email" />
</HxFragment>
```
