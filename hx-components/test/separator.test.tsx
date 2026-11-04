import {describe, expect, it} from 'vitest';
import {HxSeparator} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

describe('HxSeparator', () => {
	it('renders a horizontal separator with defaults', () => {
		const {container} = renderWithProvider(<HxSeparator/>);
		const div = queryByDataAttr(container, 'data-hx-separator')!;
		expect(div.tagName.toLowerCase()).toBe('div');
		expect(div.getAttribute('data-hx-separator-direction')).toBe('dir-x');
		expect(div.getAttribute('data-hx-margin-x')).toBe('none');
		expect(div.getAttribute('data-hx-margin-y')).toBe('none');
		expect(div.hasAttribute('data-hx-color')).toBe(false);
		expect(div.hasAttribute('data-hx-separator-size')).toBe(false);
	});

	it('maps direction, size, color and margins', () => {
		const {container} = renderWithProvider(
			<HxSeparator direction="dir-y" size="sm" color="primary" marginX="md" marginY="lg"/>
		);
		const div = queryByDataAttr(container, 'data-hx-separator')!;
		expect(div.getAttribute('data-hx-separator-direction')).toBe('dir-y');
		expect(div.getAttribute('data-hx-separator-size')).toBe('sm');
		expect(div.getAttribute('data-hx-color')).toBe('primary');
		expect(div.getAttribute('data-hx-margin-x')).toBe('md');
		expect(div.getAttribute('data-hx-margin-y')).toBe('lg');
	});

	it('marks the hidden state', () => {
		const {container} = renderWithProvider(<HxSeparator $visible={false}/>);
		expect(queryByDataAttr(container, 'data-hx-separator')!.getAttribute('data-hx-visible')).toBe('no');
	});

	it('forwards className and ref', () => {
		const ref = {current: null as HTMLDivElement | null};
		renderWithProvider(<HxSeparator className="host-class" ref={ref}/>);
		expect(ref.current).not.toBeNull();
		expect(ref.current!.classList.contains('host-class')).toBe(true);
	});
});
