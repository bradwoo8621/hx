import {describe, expect, it} from 'vitest';
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
        let events: any[] = [];
        
        ERO.on(obj, 'user.*', (event) => {
            callCount++;
            paths.push(event.pathToRoot);
            events.push(event);
        });
        
        // Also monitor 'user' for comparison
        let userCallCount = 0;
        ERO.on(obj, 'user', (event) => {
            userCallCount++;
            console.log('user listener triggered for:', event.pathToRoot);
        });
        
        // Replace entire user object
        obj.user = {name: 'Jane', age: 25};
        
        console.log('user.* call count:', callCount);
        console.log('user.* paths:', paths);
        console.log('user call count:', userCallCount);
        
        // When user is replaced, what is the event path?
        expect(callCount).toBe(0); // user.* should NOT trigger
        expect(userCallCount).toBe(1); // user listener should trigger once
    });
});
