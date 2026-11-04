import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {HxBadge} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

describe('HxBadge', () => {
	it('renders a label span with badge defaults', () => {
		const {container} = renderWithProvider(<HxBadge text="New"/>);
		const span = queryByDataAttr(container, 'data-hx-badge')!;
		expect(span.tagName.toLowerCase()).toBe('span');
		expect(span.textContent).toBe('New');
		expect(span.getAttribute('data-hx-badge-variant')).toBe('solid');
		expect(span.getAttribute('data-hx-badge-size')).toBe('sm');
		expect(span.getAttribute('data-hx-border-radius')).toBe('round');
		expect(span.getAttribute('data-hx-color')).toBe('primary');
		expect(span.getAttribute('data-hx-padding-x')).toBe('md');
	});

	it('is opaque for the solid variant only', () => {
		const solid = renderWithProvider(<HxBadge text="a" variant="solid"/>, {container: document.createElement('div')});
		expect(queryByDataAttr(solid.container, 'data-hx-badge')!.getAttribute('data-hx-label-opaque')).toBe('');

		const outline = renderWithProvider(<HxBadge text="b" variant="outline"/>, {container: document.createElement('div')});
		expect(queryByDataAttr(outline.container, 'data-hx-badge')!.hasAttribute('data-hx-label-opaque')).toBe(false);

		const dashed = renderWithProvider(<HxBadge text="c" variant="dashed"/>, {container: document.createElement('div')});
		expect(queryByDataAttr(dashed.container, 'data-hx-badge')!.hasAttribute('data-hx-label-opaque')).toBe(false);
	});

	it('maps explicit appearance props to attributes', () => {
		const {container} = renderWithProvider(
			<HxBadge text="x" variant="dashed" size="std" borderRadius="sm" color="danger" paddingX="sm"/>
		);
		const span = queryByDataAttr(container, 'data-hx-badge')!;
		expect(span.getAttribute('data-hx-badge-variant')).toBe('dashed');
		expect(span.getAttribute('data-hx-badge-size')).toBe('std');
		expect(span.getAttribute('data-hx-border-radius')).toBe('sm');
		expect(span.getAttribute('data-hx-color')).toBe('danger');
		expect(span.getAttribute('data-hx-padding-x')).toBe('sm');
	});

	it('inherits label text and i18n behaviour', () => {
		renderWithProvider(<HxBadge text="~badge.unknown"/>);
		expect(screen.getByText('badge.unknown')).toBeTruthy();
	});

	it('forwards ref to the underlying span', () => {
		const ref = {current: null as HTMLSpanElement | null};
		renderWithProvider(<HxBadge text="x" ref={ref}/>);
		expect(ref.current).not.toBeNull();
		expect(ref.current!.tagName.toLowerCase()).toBe('span');
	});
});
