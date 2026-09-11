# HX Component Library - CLAUDE.md

## Project Overview
HX is a lightweight, design-system driven React component library built for enterprise applications. It provides a set of reusable, accessible, and highly customizable UI components with consistent styling and behavior.

## Core Principles
1. **Design System First**: All components follow the global design system defined in `src/styles/variables/`
2. **Minimal Dependencies**: Avoid unnecessary third-party dependencies to keep the library lightweight
3. **Type Safety**: Full TypeScript support with strict type checking
4. **Performance**: Optimize for runtime performance and minimal bundle size

## Technology Stack
- **React 18+**: UI framework
- **TypeScript**: Type safety
- **CSS3**: Native CSS with custom properties (no CSS-in-JS)
- **Storybook**: Component documentation and testing
- **ERO**: Reactive data model for form binding (`@hx/data`)

## Component Structure
Each component follows this standard structure:
```
src/components/[component-name]/
├── [component-name].tsx          # Main component implementation
├── types.ts                      # Props types and excluded data attribute names
├── defaults.ts                   # Hx[Name]Settings interface + Hx[Name]Defaults + configHx[Name]
├── index.ts                      # Barrel exports: types, config, component
├── [component-name].stories.tsx  # Storybook documentation (in stories/)
└── [component-name].test.tsx     # Unit tests (in test/, optional)
```

## Language Rules
- **Strictly enforced**: All file content (code, comments, documentation) and git commit messages must be in English.

## Code Style Guidelines
### TypeScript
- Follow global TypeScript rules defined in the root CLAUDE.md
- Never use `@ts-ignore`, use `@ts-expect-error` with clear comments only when necessary
- All component props must have proper TypeScript interfaces
- Export types for all public component APIs

### Props and Data Attributes
- `HxStdProps` = `$visible` + change props; `HxEditProps` adds `$disabled`; `HxEditSingleFieldProps` adds `$model`/`$field` (see `src/types/standard.ts`)
- `HxCommonProps<ExDAT, T>` (`src/types/component.ts`) bundles the size/padding/margin/border/flex-cell/grid-cell props plus the pass-through `data-*` index signature; a component declares the attributes it owns in its `Excluded[Name]DataAttrNames` union and passes it as `ExDAT`
- Components register a `HxDataPropToAttrValueComputer` (`src/utils/props.ts`) keyed by their name (e.g. `'HxFlex'`), which maps props to `data-hx-*` attributes and resolves defaults
- `DOMUtils.exposePropsToDOM(rest, $model, context, {key, default, visible, disabled, readonly})` computes the attributes and filters consumed props before spreading onto the DOM element
- `Exclude<HxDomDataAttrName, ...>` on the template-literal type does NOT actually remove a literal — the per-component excluded lists are declaration-of-intent only, not compile-time guards

### CSS
- All styles use global CSS custom properties from `src/styles/variables/`
- Reset rules stay scoped to the component trees (`src/styles/reset/`: box-sizing on `[data-hx-root]` / `[data-hx-portal-root]` subtrees, `position: relative` on their `div`s); the global `html` / `body` reset only applies when `data-hx-reset-styles` is set, which `HxContextProvider` does through its `resetHtmlStyles` / `resetBodyStyles` props
- Every stylesheet is imported from `src/styles/index.css` with `@import "<file>.css" layer(hx)`, keeping all hx styles inside the `hx` cascade layer so unlayered application styles override them without specificity escalation
- Styles live in `src/styles/` split into: `variables/` (design tokens), `common/` (shared slot rules: color, padding, margin, border, width, height, transition, visibility, cell position/gap), `components/<name>/*.css` (per-component modules with their own `index.css` and `variables.css`), and `components/origin/` for the not-yet-migrated stylesheets (datetime-picker, table, tabs, upload)
- Component styles are scoped using data attributes (e.g., `[data-hx-button]`); every element in the hx trees derives its styling slots (the `--hx-*-this` / `--hx-*-this-default` custom properties) so a consumer or a parent component can override a single aspect by setting the slot
- `font-family` declarations consume their component token (e.g. `var(--hx-button-font-family)`) as the whole font stack; the token itself defaults to `--hx-font-family`, which already ends in generic families
- Use semantic class names and avoid deep nesting
- Add clear comments for complex CSS rules and behavior

### Components
- All components must support automatic `$model` propagation for form binding
- Use data attributes for component configuration instead of class names
- Include proper accessibility attributes (roles; ARIA states are not used)
- Support keyboard navigation and focus management
- Provide consistent props API across similar components

## Available Components
### Form
- `HxInput` / `HxFormatInput` / `HxTextarea`: text, formatted and multiline inputs
- `HxCheckbox` / `HxRadio`: single controls; `HxMCheckbox` / `HxMRadio`: multi-option groups
- `HxSelect` / `HxMSelect` / `HxDateTimePicker` / `HxUpload`: picker and upload controls
- `HxButton`: multiple variants and sizes; `HxActions` / `HxButtonBar`: button groups with popup menus
- `HxLabel` / `HxBadge` / `HxSeparator` / `HxCallout`: display primitives

### Layout
- `HxBox` / `HxFlex` / `HxGrid`: box, flexible and grid layout
- `HxPanel`: collapsible panel with header and grid body
- `HxTabs` / `HxTable` / `HxPagination`: content organization

### Overlay
- `HxOverlay`: base portal overlay with roles; `HxDialog` / `HxDrawer` / `HxAlert` / `HxToast` are its wrappers
- `HxPopup`: anchored popup positioned relative to a trigger (`HxPopupProvider` context)

### Infrastructure
- `HxContextProvider` (contexts), `HxInputBox` / `HxWithCheck` / `HxSelectOptions` (HOCs / shared bases), hooks (`useDataMonitor`, `useDualRef`, `useDelayedFunc`, `useForceUpdate`), `HxDataUtils` / `DOMUtils` / `HxDataPropToAttrValueComputer` (utils)

## CSS Variables System
The design system uses a comprehensive set of CSS variables, split into per-category modules under `src/styles/variables/` and aggregated by `src/styles/variables/index.css`:
- **Colors**: Theme colors (primary, success, danger, warning, info, waive), foreground and background tokens
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Generic padding/margin/gap scales plus text-specific aliases
- **Borders**: Border widths, radii, colors, box shadows
- **Animations**: Standard transition durations and easing

## Development Workflow
1. Create new component following the standard structure
2. Add Storybook stories for all component variants and use cases
3. Write unit tests for core functionality
4. Update documentation
5. Run lint checks before submitting changes

## Gap/Spacing Size Reference
| Size | Vertical Value | Horizontal Value |
|------|----------------|------------------|
| none | 0px            | 0px              |
| xs   | 4px            | 8px              |
| sm   | 8px            | 16px             |
| md   | 12px           | 24px             |
| lg   | 16px           | 32px             |
| xl   | 20px           | 40px             |

## Maintenance Notes
- Keep CSS variables consistent across all components
- Avoid breaking changes to the public API without proper deprecation
- Update documentation when adding new features or modifying behavior
- Run Storybook regularly to verify all components work as expected
