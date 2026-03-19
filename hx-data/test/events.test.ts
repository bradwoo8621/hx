import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from '../src/events';

describe('EventEmitter', () => {
  it('emits events to registered listeners', () => {
    const emitter = new EventEmitter();
    const listener = vi.fn();

    emitter.on('test-event', listener);
    emitter.emit('test-event', 'arg1', 'arg2');

    expect(listener).toHaveBeenCalledWith('arg1', 'arg2');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('supports multiple listeners for the same event', () => {
    const emitter = new EventEmitter();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    emitter.on('test-event', listener1);
    emitter.on('test-event', listener2);
    emitter.emit('test-event');

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  it('removes listeners with off()', () => {
    const emitter = new EventEmitter();
    const listener = vi.fn();

    emitter.on('test-event', listener);
    emitter.off('test-event', listener);
    emitter.emit('test-event');

    expect(listener).not.toHaveBeenCalled();
  });

  it('supports once() listeners that only fire once', () => {
    const emitter = new EventEmitter();
    const listener = vi.fn();

    emitter.once('test-event', listener);
    emitter.emit('test-event');
    emitter.emit('test-event');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('removes all listeners for an event with offAll(eventName)', () => {
    const emitter = new EventEmitter();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    emitter.on('event1', listener1);
    emitter.on('event2', listener2);
    emitter.offAll('event1');

    emitter.emit('event1');
    emitter.emit('event2');

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  it('removes all listeners for all events with offAll()', () => {
    const emitter = new EventEmitter();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    emitter.on('event1', listener1);
    emitter.on('event2', listener2);
    emitter.offAll();

    emitter.emit('event1');
    emitter.emit('event2');

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });

  it('returns false when emitting event with no listeners', () => {
    const emitter = new EventEmitter();
    expect(emitter.emit('non-existent-event')).toBe(false);
  });

  it('returns true when emitting event with listeners', () => {
    const emitter = new EventEmitter();
    emitter.on('test-event', () => {});
    expect(emitter.emit('test-event')).toBe(true);
  });

  it('supports chaining method calls', () => {
    const emitter = new EventEmitter();
    const listener = vi.fn();

    const result = emitter
      .on('event1', listener)
      .on('event2', listener)
      .off('event1', listener)
      .once('event3', listener);

    expect(result).toBe(emitter);
  });
});
