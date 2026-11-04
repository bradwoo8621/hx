import {fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {HxActions, HxButton, HxButtonBar, HxCompactButtonBar, HxLabel} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

describe('HxActions', () => {
	it('renders a string trigger button', () => {
		const {container} = renderWithProvider(
			<HxActions leading="Actions" tailing={<HxButton text="Edit"/>}/>
		);
		const trigger = queryByDataAttr(container, 'data-hx-actions')!;
		expect(trigger).not.toBeNull();
		expect(screen.getByText('Actions')).toBeTruthy();
	});

	it('falls back to an icon-only trigger when no leading is given', () => {
		const {container} = renderWithProvider(<HxActions tailing={<HxButton text="Edit"/>}/>);
		expect(queryByDataAttr(container, 'data-hx-actions')).not.toBeNull();
		expect(container.querySelector('button[data-hx-button-svg-icon]')).not.toBeNull();
	});

	it('opens the popup and runs the selected action', async () => {
		const onClick = vi.fn();
		renderWithProvider(
			<HxActions leading="Actions" tailing={<HxButton text="Edit" onClick={onClick}/>}/>
		);
		fireEvent.click(screen.getByText('Actions'));
		await waitFor(() => expect(document.querySelector('[data-hx-actions-options]')).not.toBeNull());
		const action = screen.getByText('Edit');
		fireEvent.click(action);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('renders a separator between action groups', async () => {
		renderWithProvider(
			<HxActions leading="Actions"
			           tailing={[
				           <HxButton key="edit" text="Edit"/>,
				           [<HxButton key="delete" text="Delete"/>, <HxButton key="archive" text="Archive"/>]
			           ]}/>
		);
		fireEvent.click(screen.getByText('Actions'));
		await waitFor(() => expect(document.querySelector('[data-hx-actions-options]')).not.toBeNull());
		expect(document.querySelectorAll('[data-hx-actions-options] [data-hx-separator]')).toHaveLength(1);
	});

	it('accepts a button as the trigger and uses the dropdown icon to open', async () => {
		const {container} = renderWithProvider(
			<HxActions leading={<HxButton text="Menu"/>} tailing={<HxButton text="Edit"/>}/>
		);
		expect(screen.getByText('Menu')).toBeTruthy();
		fireEvent.click(container.querySelector('button[data-hx-button-svg-icon]')!);
		await waitFor(() => expect(document.querySelector('[data-hx-actions-options]')).not.toBeNull());
		expect(screen.getByText('Edit')).toBeTruthy();
	});

	it('accepts a custom label as the trigger', () => {
		const {container} = renderWithProvider(
			<HxActions leading={<HxLabel text="Custom" data-testid="custom-trigger"/>}
			           tailing={<HxButton text="Edit"/>}/>
		);
		expect(container.querySelector('[data-testid="custom-trigger"]')).not.toBeNull();
	});

	it('disables the trigger through $disabled', () => {
		const {container} = renderWithProvider(
			<HxActions leading="Actions" tailing={<HxButton text="Edit"/>} $disabled/>
		);
		const trigger = screen.getByText('Actions').closest('button')!;
		expect(trigger.disabled).toBe(true);
		expect(queryByDataAttr(container, 'data-hx-actions')!.getAttribute('data-hx-disabled')).toBe('');
	});

	it('marks the hidden state through $visible', () => {
		const {container} = renderWithProvider(
			<HxActions leading="Actions" tailing={<HxButton text="Edit"/>} $visible={false}/>
		);
		expect(queryByDataAttr(container, 'data-hx-actions')!.getAttribute('data-hx-visible')).toBe('no');
	});

	it('forwards ref to the trigger container', () => {
		const ref = {current: null as HTMLDivElement | null};
		renderWithProvider(<HxActions leading="Actions" tailing={<HxButton text="Edit"/>} ref={ref}/>);
		expect(ref.current).not.toBeNull();
		expect(ref.current!.hasAttribute('data-hx-actions')).toBe(true);
	});
});

describe('HxButtonBar', () => {
	it('aligns a bar with both sides to space-between and applies defaults', () => {
		const {container} = renderWithProvider(
			<HxButtonBar leading={<HxButton text="Back"/>} tailing={<HxButton text="Next"/>}/>
		);
		const bar = queryByDataAttr(container, 'data-hx-button-bar')!;
		expect(bar.getAttribute('data-hx-justify-content')).toBe('space-between');
		const groups = bar.querySelectorAll(':scope > [data-hx-flex]');
		expect(groups).toHaveLength(2);
		groups.forEach(group => {
			expect(group.getAttribute('data-hx-cell-gap-x')).toBe('xs');
			expect(group.getAttribute('data-hx-cell-gap-y')).toBe('xs');
		});
		expect(bar.getAttribute('data-hx-padding-x')).toBe('lg');
		expect(bar.getAttribute('data-hx-padding-t')).toBe('md');
		expect(bar.getAttribute('data-hx-padding-b')).toBe('md');
		expect(screen.getByText('Back')).toBeTruthy();
		expect(screen.getByText('Next')).toBeTruthy();
	});

	it('aligns a leading-only bar to the start', () => {
		const {container} = renderWithProvider(<HxButtonBar leading={<HxButton text="Back"/>}/>);
		expect(queryByDataAttr(container, 'data-hx-button-bar')!.getAttribute('data-hx-justify-content')).toBe('start');
	});

	it('aligns a tailing-only bar to the end', () => {
		const {container} = renderWithProvider(<HxButtonBar tailing={<HxButton text="Next"/>}/>);
		expect(queryByDataAttr(container, 'data-hx-button-bar')!.getAttribute('data-hx-justify-content')).toBe('end');
	});

	it('renders the compact bar without padding', () => {
		const {container} = renderWithProvider(
			<HxCompactButtonBar leading={<HxButton text="Back"/>} tailing={<HxButton text="Next"/>}/>
		);
		const bar = queryByDataAttr(container, 'data-hx-button-bar')!;
		expect(bar.getAttribute('data-hx-padding-x')).toBe('none');
		expect(bar.getAttribute('data-hx-padding-t')).toBe('none');
		expect(bar.getAttribute('data-hx-padding-b')).toBe('none');
	});
});
