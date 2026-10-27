# HX

Lightweight, design-system driven React component library for enterprise applications, together with the reactive data layer it is built on.

## Packages

| Package | Description |
|---|---|
| [@hx/data](./hx-data) | Proxy-based reactive data model with path-addressed change events and no runtime dependencies |
| [@hx/components](./hx-components) | React component library: form controls, layout, overlays, table, tabs, upload, and a multi-calendar date-time picker |

## Requirements

- Node 22.18 or later, pnpm 11.5
- React 18.3 or later for consumers of `@hx/components`

## Development

```bash
vp install
vp run build:all
vp run test:all
vp run storybook:components
```

## Documentation

The documentation lives in `wiki/`, in English and Chinese, and is published to the
[project wiki](https://github.com/bradwoo8621/hx/wiki).

## License

MIT
