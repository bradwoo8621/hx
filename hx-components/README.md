# HX

HuangXie, 黄歇, 春申, 上海.

## Hooks

### useForceUpdate
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
