import {reactive} from '@hx/data';
import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import {useEffect, useRef} from 'react';
import {describe, expect, it} from 'vitest';
import {HxPopupProvider, type HxPopupVisibleRef, HxSelect, usePopupVisibleRef} from '../src';
import {renderWithProvider} from './test-utils';

const options = [
	{value: 'a', label: 'Alpha'},
	{value: 'b', label: 'Beta'},
	{value: 'c', label: 'Gamma'}
];

const OPEN_OUTER_POPUP = 'open-outer-popup';
const OUTER_POPUP_CONTENT = 'outer-popup-content';

const OpenOuterTrigger = () => {
	const ref = useRef<HTMLButtonElement>(null);
	const {visibleRef} = usePopupVisibleRef({elementRef: ref});
	return <button ref={ref} data-testid={OPEN_OUTER_POPUP}
	               onClick={() => visibleRef.current.show(false)}>open</button>;
};

/** Renders an outer popup whose content holds an HxSelect, so the select popup is nested. */
const renderNestedPopups = () => {
	const model = reactive<{value?: string | null}>({value: 'a'});
	renderWithProvider(
		<HxPopupProvider sameWidthAtMinimum={false} trigger={<OpenOuterTrigger/>}>
			<div data-testid={OUTER_POPUP_CONTENT}>
				<HxSelect $model={model} $field="value" options={options}/>
			</div>
		</HxPopupProvider>
	);
	return model;
};

/** Opens the outer popup, then the nested select popup, and returns the Beta option. */
const openNestedPopups = async () => {
	const model = renderNestedPopups();
	fireEvent.click(screen.getByTestId(OPEN_OUTER_POPUP));
	await waitFor(() => expect(screen.getByTestId(OUTER_POPUP_CONTENT)).not.toBeNull());

	const select = document.querySelector<HTMLElement>('[data-hx-select]')!;
	fireEvent.click(select);
	const beta = await screen.findByText('Beta');
	return {model, beta};
};

const popupOf = (contentTestId: string): HTMLElement | null => {
	return screen.getByTestId(contentTestId).closest('[data-hx-popup]');
};

describe('nested popup', () => {
	it('keeps the outer popup open when an option of the nested popup is clicked', async () => {
		const {model, beta} = await openNestedPopups();
		const innerPopup = beta.closest('[data-hx-popup]') as HTMLElement;
		expect(innerPopup).not.toBeNull();
		expect(popupOf(OUTER_POPUP_CONTENT)).not.toBeNull();

		fireEvent.click(beta);

		expect(model.value).toBe('b');
		// the nested popup hides after the selection, the outer one must stay open
		await waitFor(() => expect(innerPopup.isConnected).toBe(false), {timeout: 3000});
		const outerPopup = popupOf(OUTER_POPUP_CONTENT)!;
		expect(outerPopup).not.toBeNull();
		expect(['active', 'prepared']).toContain(outerPopup.getAttribute('data-hx-popup-state'));
		expect(screen.getByTestId(OUTER_POPUP_CONTENT)).not.toBeNull();
	});

	it('closes both popups when clicking outside of them', async () => {
		await openNestedPopups();
		expect(document.querySelectorAll('[data-hx-popup]')).toHaveLength(2);

		fireEvent.click(document.body);

		await waitFor(() => expect(document.querySelectorAll('[data-hx-popup]')).toHaveLength(0), {timeout: 3000});
		expect(screen.queryByTestId(OUTER_POPUP_CONTENT)).toBeNull();
	});
});

const RegisterTrigger = (props: {slot: number; onReady: (visibleRef: HxPopupVisibleRef) => void}) => {
	const {slot, onReady} = props;
	const ref = useRef<HTMLButtonElement>(null);
	const {visibleRef} = usePopupVisibleRef({elementRef: ref});
	useEffect(() => {
		onReady(visibleRef.current);
	}, [onReady, visibleRef]);
	return <button ref={ref} data-testid={`sibling-trigger-${slot}`}>trigger</button>;
};

describe('sibling popup', () => {
	it('still closes a sibling popup when the other popup is clicked', async () => {
		const refs: Array<HxPopupVisibleRef> = [];
		const registerA = (visibleRef: HxPopupVisibleRef) => {
			refs[0] = visibleRef;
		};
		const registerB = (visibleRef: HxPopupVisibleRef) => {
			refs[1] = visibleRef;
		};
		renderWithProvider(<>
			<HxPopupProvider sameWidthAtMinimum={false}
			                 trigger={<RegisterTrigger slot={0} onReady={registerA}/>}>
				<div data-testid="sibling-popup-a">A</div>
			</HxPopupProvider>
			<HxPopupProvider sameWidthAtMinimum={false}
			                 trigger={<RegisterTrigger slot={1} onReady={registerB}/>}>
				<div data-testid="sibling-popup-b">B</div>
			</HxPopupProvider>
		</>);

		act(() => {
			refs[0].show(false);
			refs[1].show(false);
		});
		await waitFor(() => expect(screen.getByTestId('sibling-popup-a')).not.toBeNull());
		await waitFor(() => expect(screen.getByTestId('sibling-popup-b')).not.toBeNull());

		fireEvent.click(screen.getByTestId('sibling-popup-b'));

		await waitFor(() => expect(screen.queryByTestId('sibling-popup-a')).toBeNull(), {timeout: 3000});
		expect(screen.getByTestId('sibling-popup-b')).not.toBeNull();
	});
});
