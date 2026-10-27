# HX Component Library

A lightweight, design-system driven React component library for enterprise applications.

HuangXie, 黄歇, 春申, 上海.

## Requirements

- React 18.3 or later (peer dependency)
- An ESM bundler (Vite, webpack, Rollup, ...)

## Installation

```bash
npm install @hx/components
# or
pnpm add @hx/components
```

`@hx/data` is pulled in automatically as a runtime dependency.

## Quick Start

Wrap your application in `HxContextProvider`, and import the stylesheet once before your own styles:

```tsx
import '@hx/components/hx-components.css';
import { HxButton, HxContextProvider } from '@hx/components';

export const App = () => (
  <HxContextProvider>
    <HxButton text="Hello" />
  </HxContextProvider>
);
```

## Styling

The stylesheet ships as a single `@layer hx` block, so unlayered application styles always win — overriding a component rule needs neither `!important` nor a stronger selector. Component variants are selected through `data-hx-*` attributes rather than class names, and every visual value is exposed as a `--hx-*` custom property, so restyling usually means redefining a token instead of patching a rule.

## Documentation

- English wiki: <https://github.com/bradwoo8621/hx/wiki>
- 中文 wiki: <https://github.com/bradwoo8621/hx/wiki/cn-Home>
- Sources for both are kept in the repository under `wiki/`.

## References

### Icons

Certain icons used in this project are sourced from:

#### [Radix Icons](https://www.radix-ui.com/icons)

- License: MIT
- Usage: Direct copy of SVG source code

### Codes

#### [Body Scroll Lock](https://github.com/willmcpo/body-scroll-lock)

- License: MIT
- Usage: Based on it, code modifications and appropriate trimming/refactoring were performed.
