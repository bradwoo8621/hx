import {describe, expect, it, vi} from 'vitest';
import {ERO, reactive} from '../src';

describe("Path matching behavior", () => {
    it("should verify user.* pattern triggers for user changes", () => {
        const obj = reactive({user: {name: 'John', age: 30}});
        let callCount = 0;
        let paths: string[] = [];

        ERO.on(obj, 'user.*', (event) => {
            callCount++;
            paths.push(event.pathToRoot);
        });

        obj.user.name = 'Jane';
        obj.user.age = 31;

        expect(callCount).toBe(2);
        expect(paths).toEqual(['user.name', 'user.age']);
    });

    it("should verify user name pattern does NOT trigger for user changes", () => {
        const obj = reactive({user: {name: 'John', age: 30}});
        let callCount = 0;
        let paths: string[] = [];

        ERO.on(obj, 'user.name', (event) => {
            callCount++;
            paths.push(event.pathToRoot);
        });

        // Trigger a user change (not user.name)
        obj.user = {name: 'Jane', age: 25};

        // Should NOT trigger because we're monitoring user.name, not user
        expect(callCount).toBe(0);
    });

    it("should verify user.* pattern does NOT trigger when entire user is replaced", () => {
        const obj = reactive({user: {name: 'John', age: 30}});
        let callCount = 0;
        let paths: string[] = [];

        ERO.on(obj, 'user.*', (event) => {
            callCount++;
            paths.push(event.pathToRoot);
        });

        // Also monitor 'user' for comparison
        let userCallCount = 0;
        ERO.on(obj, 'user', (event) => {
            userCallCount++;
        });

        // Replace entire user object
        obj.user = {name: 'Jane', age: 25};

        // When user is replaced, what is the event path?
        expect(callCount).toBe(0); // user.* should NOT trigger
        expect(userCallCount).toBe(1); // user listener should trigger once
    });

    it("should match all events with global * pattern", () => {
        const obj = reactive({
            user: { name: 'John', age: 30 },
            items: [1, 2, 3]
        });
        const listener = vi.fn();

        ERO.on(obj, '*', listener);

        obj.user.name = 'Jane';
        obj.items[0] = 100;
        obj.user.age = 31;

        expect(listener).toHaveBeenCalledTimes(3);
        expect(listener).toHaveBeenNthCalledWith(1, expect.objectContaining({ pathToRoot: 'user.name' }));
        expect(listener).toHaveBeenNthCalledWith(2, expect.objectContaining({ pathToRoot: 'items.[0]' }));
        expect(listener).toHaveBeenNthCalledWith(3, expect.objectContaining({ pathToRoot: 'user.age' }));
    });

    it("should match nested wildcard patterns", () => {
        const obj = reactive({
            user: {
                address: {
                    city: 'London',
                    zip: 'SW1A 1AA'
                }
            }
        });
        const userWildcardListener = vi.fn();
        const addressWildcardListener = vi.fn();

        ERO.on(obj, 'user.*', userWildcardListener);
        ERO.on(obj, 'user.address.*', addressWildcardListener);

        obj.user.address.city = 'Paris';
        obj.user.address.zip = '75001';

        expect(userWildcardListener).toHaveBeenCalledTimes(2);
        expect(addressWildcardListener).toHaveBeenCalledTimes(2);
    });

    it("should match array path patterns", () => {
        const obj = reactive({
            items: [1, 2, { name: 'Test' }]
        });
        const itemsWildcardListener = vi.fn();
        const item2Listener = vi.fn();

        ERO.on(obj, 'items.*', itemsWildcardListener);
        ERO.on(obj, 'items.[2].name', item2Listener);

        obj.items[0] = 100;
        obj.items[2].name = 'Updated';

        expect(itemsWildcardListener).toHaveBeenCalledTimes(2);
        expect(item2Listener).toHaveBeenCalledTimes(1);
        expect(item2Listener).toHaveBeenCalledWith(expect.objectContaining({
            pathToRoot: 'items.[2].name',
            oldValue: 'Test',
            newValue: 'Updated'
        }));
    });

    it("should correctly unregister listeners with off()", () => {
        const obj = reactive({ count: 0 });
        const listener = vi.fn();

        ERO.on(obj, 'count', listener);
        obj.count = 1;
        expect(listener).toHaveBeenCalledTimes(1);

        ERO.off(obj, 'count', listener);
        obj.count = 2;
        expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it("should unregister wildcard listeners correctly", () => {
        const obj = reactive({ user: { name: 'John', age: 30 } });
        const listener = vi.fn();

        ERO.on(obj, 'user.*', listener);
        obj.user.name = 'Jane';
        expect(listener).toHaveBeenCalledTimes(1);

        ERO.off(obj, 'user.*', listener);
        obj.user.age = 31;
        expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it("should unregister global * listeners correctly", () => {
        const obj = reactive({ count: 0, name: 'Test' });
        const listener = vi.fn();

        ERO.on(obj, '*', listener);
        obj.count = 1;
        expect(listener).toHaveBeenCalledTimes(1);

        ERO.off(obj, '*', listener);
        obj.name = 'Updated';
        expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it("should handle multiple listeners for the same path", () => {
        const obj = reactive({ count: 0 });
        const listener1 = vi.fn();
        const listener2 = vi.fn();

        ERO.on(obj, 'count', listener1);
        ERO.on(obj, 'count', listener2);

        obj.count = 1;
        expect(listener1).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledTimes(1);

        ERO.off(obj, 'count', listener1);
        obj.count = 2;
        expect(listener1).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledTimes(2);
    });

    it("should not trigger events for identical value assignments", () => {
        const obj = reactive({ name: 'John', age: 30 });
        const listener = vi.fn();

        ERO.on(obj, 'name', listener);
        obj.name = 'John'; // Same value

        expect(listener).not.toHaveBeenCalled();
    });

    it("should trigger delete property events", () => {
        const obj = reactive({ user: { name: 'John', age: 30 } }) as any;
        const listener = vi.fn();

        ERO.on(obj, 'user.age', listener);
        delete obj.user.age;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            oldValue: 30,
            newValue: (void 0)
        }));
    });
});

