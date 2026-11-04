import {afterEach, describe, expect, it, vi} from 'vitest';
import {
	BodyScrollLock,
	DeviceCheck,
	HxConsole,
	HxDataAttributesUtils,
	HxDataPropToAttrValueComputer,
	type HxContext
} from '../src';

const context = {} as HxContext;

afterEach(() => {
	HxConsole.logEnabled = false;
	HxConsole.debugEnabled = false;
});

describe('HxDataPropToAttrValueComputer.DefaultComputeFunc', () => {
	const compute = HxDataPropToAttrValueComputer.DefaultComputeFunc;

	it('normalises values', () => {
		expect(compute(undefined)).toBeUndefined();
		expect(compute(null)).toBeUndefined();
		expect(compute(true)).toBe('');
		expect(compute(false)).toBeUndefined();
		expect(compute('text')).toBe('text');
		expect(compute(0)).toBe('0');
		expect(compute(12)).toBe('12');
	});
});

describe('HxDataPropToAttrValueComputer', () => {
	it('maps props to attributes and falls back to defaults', () => {
		const computer = HxDataPropToAttrValueComputer.create('Probe')
			.propsAsIs({size: 'data-hx-size'})
			.and('color');
		computer.register();

		expect(computer.compute({size: 'md', color: 'danger'}, undefined, context))
			.toMatchObject({'data-hx-size': 'md', 'data-hx-color': 'danger'});
		expect(computer.compute({}, undefined, context, {size: 'sm'}))
			.toMatchObject({'data-hx-size': 'sm'});
	});

	it('runs compute functions for registered props', () => {
		const computer = HxDataPropToAttrValueComputer.create('ProbeFn')
			.prop('count', 'data-hx-count', value => String(Number(value) * 2));
		computer.register();
		expect(computer.compute({count: 3}, undefined, context)).toMatchObject({'data-hx-count': '6'});
	});

	it('consumes registered props and keeps ordinary props in trimOffKeys', () => {
		const computer = HxDataPropToAttrValueComputer.create('ProbeTrim')
			.propsAsIs({size: 'data-hx-size'});
		computer.register();
		expect(computer.trimOffKeys({size: 'md', className: 'host', 'data-hx-extra': 'x'}))
			.toEqual({className: 'host'});
	});

	it('forwards unregistered data-* props unchanged', () => {
		const computer = HxDataPropToAttrValueComputer.create('ProbePass');
		computer.register();
		expect(computer.compute({'data-hx-custom': 'yes'}, undefined, context))
			.toMatchObject({'data-hx-custom': 'yes'});
	});

	it('warns when computing with an unknown key', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => (void 0));
		expect(HxDataAttributesUtils.compute({}, undefined, context, 'MissingProbe')).toEqual({});
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});
});

describe('HxConsole', () => {
	it('suppresses log and debug unless enabled', () => {
		const log = vi.spyOn(console, 'log').mockImplementation(() => (void 0));
		const debug = vi.spyOn(console, 'debug').mockImplementation(() => (void 0));

		HxConsole.log('hidden');
		HxConsole.debug('hidden');
		expect(log).not.toHaveBeenCalled();
		expect(debug).not.toHaveBeenCalled();

		HxConsole.logEnabled = true;
		HxConsole.debugEnabled = true;
		HxConsole.log('shown');
		HxConsole.debug('shown');
		expect(log).toHaveBeenCalledWith('shown');
		expect(debug).toHaveBeenCalledWith('shown');

		log.mockRestore();
		debug.mockRestore();
	});
});

describe('DeviceCheck', () => {
	const platformDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'platform');
	const userAgentDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');
	const touchDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'maxTouchPoints');

	const setNavigator = (platform: string, userAgent: string, maxTouchPoints = 0) => {
		Object.defineProperty(window.navigator, 'platform', {value: platform, configurable: true});
		Object.defineProperty(window.navigator, 'userAgent', {value: userAgent, configurable: true});
		Object.defineProperty(window.navigator, 'maxTouchPoints', {value: maxTouchPoints, configurable: true});
	};

	afterEach(() => {
		if (platformDescriptor != null) {
			Object.defineProperty(window.navigator, 'platform', platformDescriptor);
		}
		if (userAgentDescriptor != null) {
			Object.defineProperty(window.navigator, 'userAgent', userAgentDescriptor);
		}
		if (touchDescriptor != null) {
			Object.defineProperty(window.navigator, 'maxTouchPoints', touchDescriptor);
		}
	});

	it('detects Mac', () => {
		setNavigator('MacIntel', 'Mozilla/5.0');
		expect(DeviceCheck.checkMac()).toBe(true);
		expect(DeviceCheck.checkIOSDevice()).toBe(false);
	});

	it('detects an iPad reporting as MacIntel with touch support', () => {
		setNavigator('MacIntel', 'Mozilla/5.0', 5);
		expect(DeviceCheck.checkIOSDevice()).toBe(true);
	});

	it('detects iOS and Android devices', () => {
		setNavigator('iPhone', 'Mozilla/5.0');
		expect(DeviceCheck.checkIOSDevice()).toBe(true);
		setNavigator('Linux', 'Mozilla/5.0 (Linux; Android 14)');
		expect(DeviceCheck.checkAndroid()).toBe(true);
	});
});

describe('BodyScrollLock', () => {
	it('locks and restores the body overflow in a nested and balanced way', () => {
		expect(document.body.style.overflow).toBe('');
		BodyScrollLock.lock();
		expect(document.body.style.overflow).toBe('hidden');
		BodyScrollLock.lock();
		expect(document.body.style.overflow).toBe('hidden');
		BodyScrollLock.unlock();
		expect(document.body.style.overflow).toBe('hidden');
		BodyScrollLock.unlock();
		expect(document.body.style.overflow).toBe('');
	});
});
