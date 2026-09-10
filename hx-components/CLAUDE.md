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
- **ERO**: Reactive data model for form binding

## Component Structure
Each component follows this standard structure:
```
src/components/[component-name]/
├── [component-name].tsx          # Main component implementation
├── [component-name].stories.tsx  # Storybook documentation
└── [component-name].test.tsx     # Unit tests (optional)
```

## Language Rules
- **Strictly enforced**: All file content (code, comments, documentation) and git commit messages must be in English.

## Code Style Guidelines
### TypeScript
- Follow global TypeScript rules defined in the root CLAUDE.md
- Never use `@ts-ignore`, use `@ts-expect-error` with clear comments only when necessary
- All component props must have proper TypeScript interfaces
- Export types for all public component APIs

### CSS
- All styles use global CSS custom properties from `src/styles/variables/`
- Reset rules stay scoped to the component trees (`src/styles/reset/`: box-sizing on `[data-hx-root]` / `[data-hx-portal-root]` subtrees, `position: relative` on their `div`s); the global `html` / `body` reset only applies when `data-hx-reset-styles` is set, which `HxContextProvider` does through its `resetHtmlStyles` / `resetBodyStyles` props
- Component styles are scoped using data attributes (e.g., `[data-hx-button]`)
- Every stylesheet is imported from `src/styles/index.css` with `@import "<file>.css" layer(hx)`, keeping all hx styles inside the `hx` cascade layer so unlayered application styles override them without specificity escalation
- `font-family` declarations consume their component token (e.g. `var(--hx-button-font-family)`) as the whole font stack; the token itself defaults to `--hx-font-family`, which already ends in generic families
- Use semantic class names and avoid deep nesting
- Add clear comments for complex CSS rules and behavior
- Follow BEM naming convention for modifier classes

### Components
- All components must support automatic `$model` propagation for form binding
- Use data attributes for component configuration instead of class names
- Include proper accessibility attributes (ARIA labels, roles, etc.)
- Support keyboard navigation and focus management
- Provide consistent props API across similar components

## Available Components
### Layout
- `HxFlex`: Flexible box layout component with responsive gap and padding controls
- `HxGrid`: 12/15/16 column grid layout system

### Form
- `HxInput`: Text input field with validation support
- `HxButton`: Button component with multiple variants and sizes
- `HxLabel`: Text label component for form fields

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