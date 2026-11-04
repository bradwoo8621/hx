import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {HxCallout} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

describe('HxCallout', () => {
	it('renders the message inside a vertical flex container with defaults', () => {
		const {container} = renderWithProvider(<HxCallout kind="info" message="Heads up"/>);
		const callout = queryByDataAttr(container, 'data-hx-callout')!;
		expect(callout.getAttribute('data-hx-flex-direction')).toBe('dir-y');
		expect(callout.getAttribute('data-hx-border-radius')).toBe('lg');
		expect(callout.getAttribute('data-hx-padding-x')).toBe('xl');
		expect(callout.getAttribute('data-hx-padding-t')).toBe('xl');
		expect(callout.getAttribute('data-hx-padding-b')).toBe('xl');
		expect(callout.hasAttribute('data-hx-border')).toBe(false);
		expect(screen.getByText('Heads up')).toBeTruthy();
	});

	it('maps each preset kind to its icon and color', () => {
		const cases = [
			['info', 'info', 'info'],
			['success', 'success', 'success'],
			['question', 'question', 'primary'],
			['warn', 'exclamation', 'warn'],
			['error', 'error', 'danger']
		] as const;
		for (const [kind, iconName, color] of cases) {
			const {container, unmount} = renderWithProvider(<HxCallout kind={kind} message="msg"/>);
			const background = queryByDataAttr(container, 'data-hx-callout-background')!;
			const icon = queryByDataAttr(container, 'data-hx-callout-icon')!;
			expect(background.getAttribute('data-hx-color')).toBe(color);
			expect(icon.querySelector(`[data-hx-svg-icon-name="${iconName}"]`)).not.toBeNull();
			unmount();
		}
	});

	it('uses a React element as the icon without forcing a color', () => {
		const {container} = renderWithProvider(
			<HxCallout kind={<span data-testid="custom-icon"/>} message="msg"/>
		);
		const background = queryByDataAttr(container, 'data-hx-callout-background')!;
		expect(background.hasAttribute('data-hx-color')).toBe(false);
		expect(container.querySelector('[data-testid="custom-icon"]')).not.toBeNull();
	});

	it('falls back to the error look for an unknown kind value', () => {
		const {container} = renderWithProvider(
			<HxCallout kind="unknown" message="msg"/>
		);
		const background = queryByDataAttr(container, 'data-hx-callout-background')!;
		expect(background.getAttribute('data-hx-color')).toBe('danger');
		expect(container.querySelector('[data-hx-svg-icon-name="error"]')).not.toBeNull();
	});

	it('accepts caller overrides for the default styling props', () => {
		const {container} = renderWithProvider(
			<HxCallout kind="info" message="msg" border borderRadius="sm" paddingX="sm" paddingT="sm" paddingB="sm"/>
		);
		const callout = queryByDataAttr(container, 'data-hx-callout')!;
		expect(callout.getAttribute('data-hx-border')).toBe('');
		expect(callout.getAttribute('data-hx-border-radius')).toBe('sm');
		expect(callout.getAttribute('data-hx-padding-x')).toBe('sm');
	});
});
