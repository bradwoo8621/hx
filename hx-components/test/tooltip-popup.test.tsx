import {useRef, useState} from 'react';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {HxLabel, HxPopupProvider, usePopupVisibleRef} from '../src';
import {renderWithProvider} from './test-utils';

const setTriggerSize = (el: HTMLElement) => {
	Object.defineProperty(el, 'offsetWidth', {value: 100, configurable: true});
	Object.defineProperty(el, 'offsetHeight', {value: 32, configurable: true});
};

describe('tooltip', () => {
	it('shows a string tooltip on hover and hides on leave', async () => {
		renderWithProvider(<HxLabel text="Trigger" tooltip="Tip content"/>);
		const trigger = screen.getByText('Trigger');
		setTriggerSize(trigger);
		fireEvent.mouseEnter(trigger);
		await waitFor(() => expect(document.querySelector('[data-hx-tooltip]')).not.toBeNull(), {timeout: 3000});
		expect(document.querySelector('[data-hx-tooltip-content]')!.textContent).toContain('Tip content');
		expect(trigger.hasAttribute('data-hx-tooltip-podium')).toBe(true);

		fireEvent.mouseLeave(trigger);
		await waitFor(() => expect(document.querySelector('[data-hx-tooltip]')).toBeNull());
	});

	it('accepts tooltip options', async () => {
		renderWithProvider(
			<HxLabel text="Trigger" tooltip={{content: 'Options tip', position: 'bottom', showDelay: 100}}/>
		);
		const trigger = screen.getByText('Trigger');
		setTriggerSize(trigger);
		fireEvent.mouseEnter(trigger);
		await waitFor(() => expect(document.querySelector('[data-hx-tooltip]')).not.toBeNull(), {timeout: 3000});
		expect(document.querySelector('[data-hx-tooltip-content]')!.textContent).toContain('Options tip');
	});

	it('accepts a React element as tooltip content', async () => {
		renderWithProvider(
			<HxLabel text="Trigger" tooltip={<strong data-testid="tip-el">Element tip</strong>}/>
		);
		const trigger = screen.getByText('Trigger');
		setTriggerSize(trigger);
		fireEvent.mouseEnter(trigger);
		await waitFor(() => expect(document.querySelector('[data-testid="tip-el"]')).not.toBeNull(), {timeout: 3000});
	});
});

const PopupTrigger = () => {
	const ref = useRef<HTMLButtonElement>(null);
	const {visibleRef} = usePopupVisibleRef({elementRef: ref});
	const [open, setOpen] = useState(false);
	return <>
		<button ref={ref} onClick={() => {
			visibleRef.current.show(false);
			setOpen(true);
		}}>open popup
		</button>
		<button onClick={() => {
			visibleRef.current.hide();
			setOpen(false);
		}}>hide popup
		</button>
		<span data-testid="visible-state">{open ? 'open' : 'closed'}</span>
	</>;
};

const PopupContent = (props: { visible?: boolean }) => {
	return <div data-testid="popup-content" data-visible={props.visible ? 'yes' : 'no'}>popup body</div>;
};

describe('HxPopupProvider', () => {
	it('renders no popup before it is shown', () => {
		renderWithProvider(
			<HxPopupProvider sameWidthAtMinimum={false} trigger={<PopupTrigger/>}>
				<PopupContent/>
			</HxPopupProvider>
		);
		expect(document.querySelector('[data-hx-popup]')).toBeNull();
	});

	it('opens and closes the popup with the visible ref', async () => {
		const {container} = renderWithProvider(
			<>
				<HxPopupProvider sameWidthAtMinimum={false} trigger={<PopupTrigger/>}>
					<PopupContent/>
				</HxPopupProvider>
			</>
		);
		fireEvent.click(screen.getByText('open popup'));
		await waitFor(() => expect(document.querySelector('[data-hx-popup]')).not.toBeNull());
		const popup = document.querySelector<HTMLElement>('[data-hx-popup]')!;
		expect(popup.getAttribute('role')).toBe('popup');
		expect(document.querySelector('[data-testid="popup-content"]')).not.toBeNull();
		expect(document.querySelector('[data-hx-portal-root]')).not.toBeNull();
		expect(container.querySelector('[data-hx-popup]')).toBeNull();

		fireEvent.click(screen.getByText('hide popup'));
		await waitFor(() => expect(document.querySelector('[data-testid="popup-content"]')).toBeNull(), {timeout: 3000});
	});
});
