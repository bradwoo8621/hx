import {afterEach, describe, expect, it, vi} from 'vitest';
import {DOMUtils} from '../src';

/**
 * Run computeTransitionAndAnimation against a stubbed computed style.
 * CSS expands comma-separated animation/transition longhands to equal-length
 * lists (shorter lists cycle), so the stubs pair by index like real browsers.
 */
const computeWithStyle = (style: Partial<Record<'transitionProperty' | 'transitionDuration' | 'transitionDelay'
	| 'animationName' | 'animationDuration' | 'animationDelay' | 'animationIterationCount', string>>) => {
	// real computed styles always define every longhand; mirror the initial values
	const defaults = {
		transitionProperty: 'none',
		transitionDuration: '0s',
		transitionDelay: '0s',
		animationName: 'none',
		animationDuration: '0s',
		animationDelay: '0s',
		animationIterationCount: '1'
	};
	const el = document.createElement('div');
	const spy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({...defaults, ...style} as unknown as CSSStyleDeclaration);
	try {
		return DOMUtils.computeTransitionAndAnimation(el);
	} finally {
		spy.mockRestore();
	}
};

describe('DOMUtils.computeTransitionAndAnimation', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('sums transition delay and duration per entry', () => {
		const result = computeWithStyle({
			transitionProperty: 'opacity',
			transitionDuration: '1s',
			transitionDelay: '5s'
		});
		expect(result.transition).toBe(true);
		expect(result.transitionTime).toBe(6000);
		expect(result.time).toBe(6000);
	});

	it('takes the maximum over multiple transitions paired by index', () => {
		const result = computeWithStyle({
			transitionProperty: 'opacity, transform',
			transitionDuration: '1s, 3s',
			transitionDelay: '2s, 0s'
		});
		// entry ends: 2+1=3s, 0+3=3s
		expect(result.transitionTime).toBe(3000);
	});

	it('computes animation time as delay plus duration times iteration count', () => {
		const result = computeWithStyle({
			animationName: 'spin',
			animationDuration: '2s',
			animationDelay: '1s',
			animationIterationCount: '3'
		});
		expect(result.animation).toBe(true);
		expect(result.animationTime).toBe(7000);
		expect(result.time).toBe(7000);
	});

	it('handles fractional iteration counts and the default single iteration', () => {
		expect(computeWithStyle({
			animationName: 'a, b',
			animationDuration: '3s, 2s',
			animationDelay: '2s, 0s',
			animationIterationCount: '2.5, 1'
		}).animationTime).toBe(9500);   // 2+3×2.5 = 9.5s
		expect(computeWithStyle({
			animationName: 'a',
			animationDuration: '5s',
			animationDelay: '0s',
			animationIterationCount: '1'
		}).animationTime).toBe(5000);
	});

	it('ignores infinite animations and reports none when all entries are infinite', () => {
		expect(computeWithStyle({
			animationName: 'a, b',
			animationDuration: '2s, 1s',
			animationDelay: '1s, 0s',
			animationIterationCount: 'infinite, 2'
		}).animationTime).toBe(2000);   // only the finite entry counts

		const allInfinite = computeWithStyle({
			animationName: 'a',
			animationDuration: '2s',
			animationDelay: '0s',
			animationIterationCount: 'infinite'
		});
		expect(allInfinite.animation).toBe(false);
		expect(allInfinite.any).toBe(false);
		expect(allInfinite.animationTime).toBe(0);
	});
});
