# @hx/components

Design-system driven React component library. All components are built on the reactive model system powered by `@hx/data` (ERO).

## Quick Start

```bash
pnpm add @hx/components
```

```tsx
import { HxButton, HxInput, HxFlex } from '@hx/components';
import { reactive } from '@hx/data';

const form = reactive({ username: '', password: '' });

<HxFlex direction="dir-y" gapY="md" paddingX="lg">
  <HxInput $model={form} $field="username" placeholder="Username" />
  <HxInput $model={form} $field="password" type="password" />
  <HxButton text="Login" onClick={() => login(form)} />
</HxFlex>
```

## Component Index

| Component | Page | Description |
|-----------|------|-------------|
| **Form** | | |
| Button | [→](./hx-components-Button) | Action trigger with color/variant system |
| Input | [→](./hx-components-Input) | Text/password input with prefix/suffix |
| FormatInput | [→](./hx-components-FormatInput) | Formatted number/date/time input |
| Textarea | [→](./hx-components-Textarea) | Multi-line text with auto-grow |
| Checkbox | [→](./hx-components-Checkbox) | Single checkbox with value pair |
| Radio | [→](./hx-components-Radio) | Single radio with deselect support |
| MCheckbox | [→](./hx-components-MCheckbox) | Multi-checkbox group |
| MRadio | [→](./hx-components-MRadio) | Radio button group |
| Select | [→](./hx-components-Select) | Dropdown with filter/sort/clear |
| Upload | [→](./hx-components-Upload) | File upload with progress tracking |
| **Layout** | | |
| Box | [→](./hx-components-Box) | Container with border/padding |
| Flex | [→](./hx-components-Flex) | Flexbox with direction/alignment/gap |
| Grid | [→](./hx-components-Grid) | CSS Grid with 12/15/16 columns |
| Separator | [→](./hx-components-Separator) | Horizontal/vertical divider |
| PenetrableBasic | [→](./hx-components-PenetrableBasic) | Semantic HTML wrappers (HxDiv, HxH1, ...) |
| **Display** | | |
| Badge | [→](./hx-components-Badge) | Status pill/tag |
| Label | [→](./hx-components-Label) | Styled text with hover/active states |
| Callout | [→](./hx-components-Callout) | Inline alert message |
| Icons | [→](./hx-components-Icons) | 45 SVG icon components |
| **Overlay** | | |
| Overlay | [→](./hx-components-Overlay) | Portal-based modal/drawer/toast system |
| Alert | [→](./hx-components-Alert) | Modal alert dialog |
| Toast | [→](./hx-components-Toast) | Non-blocking notification |
| Popup | [→](./hx-components-Popup) | Anchored popup overlay |
| Actions | [→](./hx-components-Actions) | Dropdown action menu |
| **Structure** | | |
| Tabs | [→](./hx-components-Tabs) | Tabbed content with header navigation |
| Panel | [→](./hx-components-Panel) | Collapsible panel with header |
| Pagination | [→](./hx-components-Pagination) | Page navigation with size selector |
| ButtonBar | [→](./hx-components-ButtonBar) | Horizontal button grouping |
| **Validation** | | |
| WithCheck | [→](./hx-components-WithCheck) | Validation HOC + pre-built variants |
| **Shared** | | |
| Common | [→](./hx-components-Common) | $model/$field pattern, global config, styling |
| Hooks | [→](./hx-components-Hooks) | useHxPopupContext, useHxTabs, ... |
| Utilities | [→](./hx-components-Utilities) | computePaginationData, parseFileName, ... |

## Architecture

- **Reactive binding** — `$model` + `$field` pattern via `ERO.getValue()`/`ERO.setValue()`. `$model` auto-propagates to children.
- **Design tokens** — Styling via `data-*` attributes (`data-hx-button`, `data-hx-color`). No CSS-in-JS.
- **Global config** — Each component group exposes `configHx*()` for defaults, read at render time.
- **Event-based** — Popups, overlays, tabs, uploads use internal `EventEmitter` for cross-component communication.
