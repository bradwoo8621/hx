import { describe, it, expect } from 'vitest';
import { parsePath, get, set } from '../src/path';

describe('Path utilities', () => {
  describe('parsePath', () => {
    it('parses simple dot-delimited paths', () => {
      expect(parsePath('user.name')).toEqual(['user', 'name']);
      expect(parsePath('user.address.city')).toEqual(['user', 'address', 'city']);
    });

    it('parses paths with array indices', () => {
      expect(parsePath('items.[0]')).toEqual(['items', '[0]']);
      expect(parsePath('user.addresses.[1].street')).toEqual(['user', 'addresses', '[1]', 'street']);
      expect(parsePath('matrix.[0].[1]')).toEqual(['matrix', '[0]', '[1]']);
    });

    it('parses single segment paths', () => {
      expect(parsePath('name')).toEqual(['name']);
      expect(parsePath('[0]')).toEqual(['[0]']);
    });
  });

  describe('get', () => {
    const testObj = {
      user: {
        name: 'John',
        age: 30,
        addresses: [
          { city: 'New York', zip: '10001' },
          { city: 'London', zip: 'SW1A 1AA' }
        ]
      },
      items: [1, 2, 3, [4, 5, 6]]
    };

    it('gets primitive values from shallow paths', () => {
      expect(get(testObj, 'user.name')).toBe('John');
      expect(get(testObj, 'user.age')).toBe(30);
    });

    it('gets values from nested object paths', () => {
      expect(get(testObj, 'user.addresses.[0].city')).toBe('New York');
      expect(get(testObj, 'user.addresses.[1].zip')).toBe('SW1A 1AA');
    });

    it('gets values from array indices', () => {
      expect(get(testObj, 'items.[0]')).toBe(1);
      expect(get(testObj, 'items.[3].[1]')).toBe(5);
    });

    it('returns (void 0) for non-existent paths', () => {
      expect(get(testObj, 'user.nonExistent')).toBe(void 0);
      expect(get(testObj, 'user.addresses.[2].city')).toBe(void 0);
      expect(get(testObj, 'items.[10]')).toBe(void 0);
      expect(get(testObj, 'invalid.path')).toBe(void 0);
    });

    it('returns (void 0) when accessing property on non-object', () => {
      expect(get(testObj, 'user.name.first')).toBe(void 0);
      expect(get(testObj, 'user.age.[0]')).toBe(void 0);
    });
  });

  describe('set', () => {
    it('sets primitive values on shallow paths', () => {
      const obj = { user: { name: 'John' } };
      set(obj, 'user.name', 'Jane');
      expect(obj.user.name).toBe('Jane');
    });

    it('sets values on nested object paths', () => {
      const obj = { user: { address: { city: 'Old York' } } };
      set(obj, 'user.address.city', 'New York');
      expect(obj.user.address.city).toBe('New York');
    });

    it('creates intermediate objects when they don\'t exist', () => {
      const obj = {} as any;
      set(obj, 'user.name', 'John');
      expect(obj.user).toEqual({ name: 'John' });

      set(obj, 'user.address.city', 'London');
      expect(obj.user.address).toEqual({ city: 'London' });
    });

    it('sets values on array indices', () => {
      const obj = { items: [1, 2, 3] };
      set(obj, 'items.[1]', 200);
      expect(obj.items).toEqual([1, 200, 3]);
    });

    it('extends array when setting out of bounds index', () => {
      const obj = { items: [1, 2] };
      set(obj, 'items.[4]', 5);
      expect(obj.items).toEqual([1, 2, void 0, void 0, 5]);
    });

    it('creates intermediate arrays when they don\'t exist', () => {
      const obj = {} as any;
      set(obj, 'items.[0]', 'first');
      expect(obj.items).toEqual(['first']);

      // @ts-ignore
      set(obj, 'matrix.[0].[1]', 42);
      expect(obj.matrix).toEqual([[void 0, 42]]);
    });

    it('supports mixed object and array paths', () => {
      const obj = { user: { addresses: [] } };
      set(obj, 'user.addresses.[0].city', 'Paris');
      expect(obj.user.addresses[0]).toEqual({ city: 'Paris' });

      set(obj, 'user.addresses.[1].zip', '75001');
      expect(obj.user.addresses[1]).toEqual({ zip: '75001' });
    });

    it('throws error when trying to set array index on non-array', () => {
      const obj = { user: { name: 'John' } };
      // @ts-ignore
      expect(() => set(obj, 'user.name.[0]', 'J')).toThrowError('Cannot use array access on non-array property name');
    });

    it('returns the modified original object', () => {
      const obj = { a: 1 };
      // @ts-ignore
      const result = set(obj, 'b', 2);
      expect(result).toBe(obj);
      // @ts-ignore
      expect(result.b).toBe(2);
    });
  });
});
