import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from '../src';

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
      .once('event3', listener)
      .offAll('event2');

    expect(result).toBe(emitter);
  });

  it('does nothing when off() is called with an unregistered listener', () => {
    const emitter = new EventEmitter();
    const registered = vi.fn();
    const unregistered = vi.fn();

    emitter.on('test-event', registered);
    emitter.off('test-event', unregistered);
    emitter.emit('test-event');

    expect(registered).toHaveBeenCalledTimes(1);
    expect(unregistered).not.toHaveBeenCalled();
  });

  it('calls the listeners registered after a once listener', () => {
    const emitter = new EventEmitter();
    const onceListener = vi.fn();
    const firstRegularListener = vi.fn();
    const secondRegularListener = vi.fn();

    emitter.once('test-event', onceListener);
    emitter.on('test-event', firstRegularListener);
    emitter.on('test-event', secondRegularListener);

    emitter.emit('test-event');
    emitter.emit('test-event');

    expect(onceListener).toHaveBeenCalledTimes(1);
    expect(firstRegularListener).toHaveBeenCalledTimes(2);
    expect(secondRegularListener).toHaveBeenCalledTimes(2);
  });

  it('does nothing when off() is called for an unknown event', () => {
    const emitter = new EventEmitter();
    const listener = vi.fn();

    emitter.on('test-event', listener);
    emitter.off('unknown-event', listener);
    emitter.emit('test-event');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does nothing when offAll() is called for an unknown event', () => {
    const emitter = new EventEmitter();
    const listener = vi.fn();

    emitter.on('test-event', listener);
    emitter.offAll('unknown-event');
    emitter.emit('test-event');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('returns false after the last listener is removed', () => {
    const emitter = new EventEmitter();
    const listener = vi.fn();

    emitter.on('test-event', listener);
    expect(emitter.emit('test-event')).toBe(true);

    emitter.off('test-event', listener);
    expect(emitter.emit('test-event')).toBe(false);
  });
});
