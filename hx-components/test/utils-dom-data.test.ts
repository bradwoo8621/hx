import {reactive} from '@hx/data';
import {createElement, isValidElement, type ReactElement} from 'react';
import {describe, expect, it} from 'vitest';
import {DOMUtils, HxDataUtils} from '../src';

describe('DOMUtils.isAttributeNameSafe', () => {
	it('accepts valid attribute names', () => {
		expect(DOMUtils.isAttributeNameSafe('data-hx-label')).toBe(true);
		expect(DOMUtils.isAttributeNameSafe('class')).toBe(true);
		expect(DOMUtils.isAttributeNameSafe('aria-label')).toBe(true);
	});

	it('rejects invalid attribute names', () => {
		expect(DOMUtils.isAttributeNameSafe('1abc')).toBe(false);
		expect(DOMUtils.isAttributeNameSafe('bad name')).toBe(false);
		expect(DOMUtils.isAttributeNameSafe('a"b')).toBe(false);
	});
});

describe('DOMUtils.safeToDom', () => {
	it('keeps only safe attribute names', () => {
		const result = DOMUtils.safeToDom({
			'data-hx-x': '1',
			'bad name': '2',
			'class': 'c'
		} as Record<string, unknown>);
		expect(result).toEqual({'data-hx-x': '1', class: 'c'});
	});
});

describe('DOMUtils.pickCommonPositionProps', () => {
	it('extracts logical position props and removes them from the source', () => {
		const props: Record<string, unknown> = {
			gCols: 2,
			'data-hx-grid-cell-cols': 2,
			fGrow: 1,
			unrelated: true
		};
		const picked = DOMUtils.pickCommonPositionProps(props);
		expect(picked).toEqual({gCols: 2, fGrow: 1});
		expect(props).toEqual({unrelated: true});
	});

	it('ignores null and empty string values', () => {
		const picked = DOMUtils.pickCommonPositionProps({gCols: '', fGrow: 1});
		expect(picked).toEqual({fGrow: 1});
	});
});

describe('DOMUtils.computeGapToViewportEdges', () => {
	it('computes gaps to every viewport edge', () => {
		const rect = {top: 10, bottom: 50, left: 20, right: 80};
		const gaps = DOMUtils.computeGapToViewportEdges(rect, 5);
		expect(gaps.top).toBe(5);
		expect(gaps.left).toBe(15);
		expect(gaps.rect).toBe(rect);
		expect(gaps.bottom).toBe(window.innerHeight - 55);
		expect(gaps.right).toBe(window.innerWidth - 85);
	});
});

describe('DOMUtils.interposeToChildren', () => {
	it('merges props into custom components while child props win', () => {
		const Child = (props: { className?: string, extra?: string }) => createElement('div', props);
		const children = createElement(Child, {className: 'child'});
		const result = DOMUtils.interposeToChildren({className: 'parent', extra: 'x'}, children) as ReactElement;
		expect(isValidElement(result)).toBe(true);
		expect(result.props.className).toBe('child');
		expect(result.props.extra).toBe('x');
	});

	it('does not touch native elements', () => {
		const children = createElement('div', {className: 'native'});
		const result = DOMUtils.interposeToChildren({className: 'parent'}, children) as ReactElement;
		expect(result.props.className).toBe('native');
	});

	it('forceInterposeToChildren overrides child props', () => {
		const Child = (props: { className?: string }) => createElement('div', props);
		const result = DOMUtils.forceInterposeToChildren(
			{className: 'parent'},
			createElement(Child, {className: 'child'})
		) as ReactElement;
		expect(result.props.className).toBe('parent');
	});

	it('returns children unchanged when no interposition is given', () => {
		const children = createElement('div');
		expect(DOMUtils.interposeToChildren(undefined, children)).toBe(children);
		expect(DOMUtils.interposeToChildren({x: 1}, undefined)).toBeUndefined();
	});
});

describe('HxDataUtils.resolveChildModel', () => {
	it('returns the model itself when no field is given', () => {
		const model = reactive({name: 'Ada'});
		expect(HxDataUtils.resolveChildModel(model)).toBe(model);
	});

	it('resolves a nested model', () => {
		const model = reactive({user: {name: 'Ada'}});
		// reactive reads produce a fresh proxy each time, so compare by value
		expect(HxDataUtils.resolveChildModel(model, 'user')).toEqual({name: 'Ada'});
	});

	it('materializes a missing child model silently', () => {
		const model = reactive<{user?: {name?: string}}>({});
		const child = HxDataUtils.resolveChildModel(model, 'user');
		expect(child).toEqual({});
		expect(model.user).toEqual({});
	});

	it('returns undefined without a model', () => {
		expect(HxDataUtils.resolveChildModel(undefined, 'user')).toBeUndefined();
	});
});
