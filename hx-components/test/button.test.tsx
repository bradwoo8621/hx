import {reactive} from '@hx/data';
import {fireEvent, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {HxButton} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

describe('HxButton', () => {
	it('renders a button element with text wrapped in a label', () => {
		const {container} = renderWithProvider(<HxButton text="Click Me"/>);
		const button = screen.getByRole('button', {name: 'Click Me'});
		expect(button.tagName.toLowerCase()).toBe('button');
		expect(button.getAttribute('type')).toBe('button');
		expect(button.getAttribute('data-hx-button')).toBe('');
		expect(queryByDataAttr(button, 'data-hx-label')).not.toBeNull();
		expect(container.textContent).toBe('Click Me');
	});

	it('applies the default uppercase flag unless disabled', () => {
		const {container: c1} = renderWithProvider(<HxButton text="a"/>);
		expect(queryByDataAttr(c1, 'data-hx-button')!.getAttribute('data-hx-button-text-uppercase')).toBe('');

		const {container: c2} = renderWithProvider(<HxButton text="a" uppercase={false}/>);
		expect(queryByDataAttr(c2, 'data-hx-button')!.hasAttribute('data-hx-button-text-uppercase')).toBe(false);
	});

	it('maps variant and color to data attributes', () => {
		const {container} = renderWithProvider(<HxButton text="a" variant="outline" color="danger"/>);
		const button = queryByDataAttr(container, 'data-hx-button')!;
		expect(button.getAttribute('data-hx-button-variant')).toBe('outline');
		expect(button.getAttribute('data-hx-color')).toBe('danger');
	});

	it('fires onClick once per click', () => {
		const onClick = vi.fn();
		renderWithProvider(<HxButton text="go" onClick={onClick}/>);
		fireEvent.click(screen.getByRole('button', {name: 'go'}));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('disables the native button and marks the state through $disabled', () => {
		const {container} = renderWithProvider(<HxButton text="go" $disabled/>);
		const button = queryByDataAttr(container, 'data-hx-button') as HTMLButtonElement;
		expect(button.disabled).toBe(true);
		expect(button.getAttribute('data-hx-disabled')).toBe('');
	});

	it('reads text from the model when $field is given', () => {
		const model = reactive({caption: 'Save'});
		const {container} = renderWithProvider(<HxButton $model={model} $field="caption"/>);
		const button = queryByDataAttr(container, 'data-hx-button')!;
		expect(button.textContent).toBe('Save');
		expect(button.getAttribute('data-hx-model-path')).toBe('caption');
	});

	it('keeps model text untranslated by default', () => {
		const model = reactive({caption: 'Save'});
		renderWithProvider(<HxButton $model={model} $field="caption"/>);
		expect(screen.getByRole('button', {name: 'Save'})).toBeTruthy();
	});

	it('marks the button hidden when $visible is false', () => {
		const {container} = renderWithProvider(<HxButton text="go" $visible={false}/>);
		expect(queryByDataAttr(container, 'data-hx-button')!.getAttribute('data-hx-visible')).toBe('no');
	});

	it('renders element text as the button content', () => {
		renderWithProvider(<HxButton text={<strong>Bold</strong>}/>);
		expect(screen.getByRole('button', {name: 'Bold'}).querySelector('strong')).not.toBeNull();
	});

	it('forwards ref and className to the button', () => {
		const ref = {current: null as HTMLButtonElement | null};
		renderWithProvider(<HxButton text="go" className="host-class" ref={ref}/>);
		expect(ref.current).not.toBeNull();
		expect(ref.current!.classList.contains('host-class')).toBe(true);
	});
});
