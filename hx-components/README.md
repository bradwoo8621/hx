# HX Component Library

A lightweight, design-system driven React component library for enterprise applications.

HuangXie, 黄歇, 春申, 上海.

## Features

- 🎨 **Design System First**: Built on a comprehensive design system with consistent styling tokens
- ⚡ **Reactive Data Binding**: Native integration with @hx/data reactive model for seamless form binding
- 🔒 **Type Safe**: Full TypeScript support with strict type checking
- 📱 **Responsive**: Built-in responsive layout components (Flex, Grid)
- ✅ **Form Validation**: Built-in validation support for form components
- 🌐 **i18n Ready**: Native internationalization support
- 📦 **Zero Dependencies**: Minimal external dependencies for small bundle size

## Quick Start

### Installation

```bash
npm install @hx/components
# or
pnpm add @hx/components
```

### Basic Usage

```tsx
import { HxFlex, HxInput, HxButton } from '@hx/components';
import { ERO } from '@hx/data';

// Create reactive form model
const formModel = ERO.reactive({
  email: '',
  password: ''
});

function LoginForm() {
  return (
    <HxFlex direction="dir-y" gapY="md" paddingX="lg" paddingT="lg" style={{ width: '400px' }}>
      <HxInput
        $model={formModel}
        $field="email"
        label="Email"
        type="text"
        required
      />
      <HxInput
        $model={formModel}
        $field="password"
        label="Password"
        type="password"
        required
      />
      <HxButton
        text="Login"
        color="primary"
        onClick={() => console.log('Form submitted', formModel)}
      />
    </HxFlex>
  );
}
```

## Components

### Layout Components

#### HxFlex
Flexible box layout component for building responsive layouts.

```tsx
<HxFlex
  direction="dir-x"  // or "dir-y" for vertical
  gapX="md"          // horizontal gap between items
  gapY="sm"          // vertical gap between items (when wrapped)
  border={true}      // optional border
  paddingX="lg"      // horizontal padding
  paddingT="md"      // top padding
  paddingB="md"      // bottom padding
>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</HxFlex>
```

**Props:**
- `direction: 'dir-x' | 'dir-y'` - Layout direction (horizontal/vertical)
- `gapX: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Horizontal gap between items
- `gapY: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Vertical gap between items
- `paddingX: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Horizontal container padding
- `paddingT: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Top container padding
- `paddingB: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Bottom container padding
- `border: boolean` - Show border around container
- `borderRadius: 'none' | 'sm' | 'md' | 'lg'` - Border radius size
- `$field: string` - Nested model path for automatic child model propagation

#### HxGrid
Responsive grid layout component with 12/15/16 column support.

```tsx
<HxGrid
  columns={12}      // 12, 15, or 16 columns
  gapX="md"         // horizontal gap between columns
  gapY="md"         // vertical gap between rows
>
  <div data-hx-grid-cols="6">Column 1 (50% width)</div>
  <div data-hx-grid-cols="6">Column 2 (50% width)</div>
  <div data-hx-grid-cols="4">Column 3 (33% width)</div>
  <div data-hx-grid-cols="8">Column 4 (67% width)</div>
</HxGrid>
```

**Child Element Attributes:**
- `data-hx-grid-cols="N"` - Number of columns to span (1-16)
- `data-hx-grid-col="N"` - Starting column position (1-16)
- `data-hx-grid-rows="N"` - Number of rows to span
- `data-hx-grid-row="N"` - Starting row position

### Form Components

#### HxInput
Text input component with reactive data binding and validation support.

```tsx
<HxInput
  $model={formModel}
  $field="email"
  label="Email Address"
  type="text"
  placeholder="Enter your email"
  required
  pattern={/^[^\s@]+@[^\s@]+\.[^\s@]+$/}
  errorMessage="Please enter a valid email"
/>
```

**Props:**
- `type: 'text' | 'password'` - Input type
- `selectAll: boolean` - Select all text on focus
- `emitChangeOnBlur: boolean` - Update model only on blur/Enter instead of on every change
- `emitChangeDelay: number` - Debounce delay for model updates (default: 100ms)
- All standard HTML input attributes are supported

#### HxButton
Button component with multiple variants and reactive state support.

```tsx
<HxButton
  text="Submit Form"
  color="primary"
  various="solid"  // 'solid' | 'outline' | 'ghost'
  onClick={handleSubmit}
  disabled={isSubmitting}
/>
```

**Props:**
- `color: 'primary' | 'success' | 'warn' | 'danger' | 'info' | 'waive'` - Button color theme
- `various: 'solid' | 'outline' | 'ghost'` - Button visual style
- `uppercase: boolean` - Convert text to uppercase
- `text: ReactNode` - Button text content
- `$field: string` - Field path to use button text from model

### Validation
All form components support built-in validation when wrapped with `HxWithCheck`.

```tsx
import { HxWithCheckInput } from '@hx/components';

<HxWithCheckInput
  $model={formModel}
  $field="password"
  required
  minLength={8}
  pattern={/^(?=.*[A-Za-z])(?=.*\d)/}
  errorMessage="Password must be at least 8 characters with letters and numbers"
/>
```

## Hooks
A simple hook that provides a function to force re-render a component.

```tsx
import { useForceUpdate } from './hooks';

const MyComponent = () => {
  const forceUpdate = useForceUpdate();

  // Call to trigger component re-render
  const handleRefresh = () => {
    forceUpdate();
  };

  return <button onClick={handleRefresh}>Refresh</button>;
};
```

### useDelayedFunc
Hook for managing delayed execution of functions with support for multiple independent tasks.
Functions are executed after a specified timeout unless cleared or replaced.

```tsx
import { useDelayedFunc } from './hooks';

const MyComponent = () => {
  const { delay, replace, clear } = useDelayedFunc(2000); // Default 2000ms timeout

  // Schedule function to execute after 2 seconds
  const handleSave = () => {
    delay('save', async () => {
      await api.saveData();
      console.log('Save completed');
    });
  };

  // Replace existing scheduled function (resets timeout)
  const handleUpdateSave = () => {
    replace('save', () => console.log('Updated save logic'));
  };

  // Cancel scheduled function
  const handleCancel = () => {
    clear('save');
  };

  return <div>...</div>;
};
```

**API:**
- `delay(key: string, func: () => void | Promise<void>, timeout?: number)`: Schedule a function for execution
- `replace(key: string, func: () => void | Promise<void>, timeout?: number)`: Replace existing scheduled function (resets timeout)
- `clear(key?: string)`: Clear single scheduled function by key, or all functions if no key provided
