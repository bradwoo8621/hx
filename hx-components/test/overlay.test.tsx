import {reactive} from '@hx/data';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {
	HxAlert,
	HxDialog,
	HxDrawer,
	HxErrorAlert,
	HxInfoAlert,
	HxLabel,
	HxToast,
	useHxContext
} from '../src';
import {renderWithProvider} from './test-utils';

const OpenButton = (props: { id: string, model?: object }) => {
	const context = useHxContext();
	return <button onClick={() => context.overlay.show(props.id, (props.model ?? reactive({})) as never)}>open</button>;
};

const HideButton = () => {
	const context = useHxContext();
	return <button onClick={() => context.overlayInstance?.hide()}>hide</button>;
};

describe('HxOverlay', () => {
	it('does not render before the overlay is shown', () => {
		renderWithProvider(
			<HxDialog id="dlg"><span>content</span></HxDialog>
		);
		expect(document.querySelector('[data-hx-overlay]')).toBeNull();
	});

	it('renders the dialog in a portal after show, with the model propagated', async () => {
		const model = reactive({name: 'Ada'});
		renderWithProvider(
			<>
				<OpenButton id="dlg" model={model}/>
				<HxDialog id="dlg">
					<HxLabel $field="name"/>
				</HxDialog>
			</>
		);
		fireEvent.click(screen.getByText('open'));
		await waitFor(() => expect(document.querySelector('[data-hx-overlay]')).not.toBeNull());

		const content = document.querySelector<HTMLElement>('[data-hx-overlay]')!;
		expect(content.getAttribute('role')).toBe('dialog');
		expect(content.hasAttribute('data-hx-dialog')).toBe(true);
		const label = content.querySelector('[data-hx-label]')!;
		expect(label.getAttribute('data-hx-model-path')).toBe('name');
		expect(label.textContent).toBe('Ada');
		expect(document.querySelector('[data-hx-overlay-backdrop]')).not.toBeNull();
	});

	it('hides through the overlay instance handle', async () => {
		renderWithProvider(
			<>
				<OpenButton id="dlg"/>
				<HxDialog id="dlg">
					<HideButton/>
				</HxDialog>
			</>
		);
		fireEvent.click(screen.getByText('open'));
		await waitFor(() => expect(screen.queryByText('hide')).not.toBeNull());
		fireEvent.click(screen.getByText('hide'));
		await waitFor(() => expect(document.querySelector('[data-hx-overlay]')).toBeNull(), {timeout: 3000});
	});

	it('hides on escape when enabled', async () => {
		renderWithProvider(
			<>
				<OpenButton id="dlg"/>
				<HxDialog id="dlg" hideOnEscape><span>content</span></HxDialog>
			</>
		);
		fireEvent.click(screen.getByText('open'));
		await waitFor(() => expect(document.querySelector('[data-hx-overlay]')).not.toBeNull());
		fireEvent.keyDown(document.querySelector('[data-hx-overlay]')!, {key: 'Escape'});
		await waitFor(() => expect(document.querySelector('[data-hx-overlay]')).toBeNull(), {timeout: 3000});
	});

	it('hides on backdrop click when enabled', async () => {
		renderWithProvider(
			<>
				<OpenButton id="dlg"/>
				<HxDialog id="dlg" hideOnClickBackdrop><span>content</span></HxDialog>
			</>
		);
		fireEvent.click(screen.getByText('open'));
		await waitFor(() => expect(document.querySelector('[data-hx-overlay]')).not.toBeNull());
		fireEvent.click(document.querySelector('[data-hx-overlay-backdrop]')!);
		await waitFor(() => expect(document.querySelector('[data-hx-overlay]')).toBeNull(), {timeout: 3000});
	});

	it.each([
		['top', 'drawer-top'],
		['right', 'drawer-right'],
		['bottom', 'drawer-bottom'],
		['left', 'drawer-left']
	] as const)('renders the drawer role for position %s', async (position, role) => {
		const {unmount} = renderWithProvider(
			<>
				<OpenButton id="drawer"/>
				<HxDrawer id="drawer" position={position}><span>drawer content</span></HxDrawer>
			</>
		);
		fireEvent.click(screen.getByText('open'));
		await waitFor(() => expect(document.querySelector('[data-hx-overlay]')).not.toBeNull());
		const content = document.querySelector<HTMLElement>('[data-hx-overlay]')!;
		expect(content.getAttribute('role')).toBe(role);
		expect(content.hasAttribute('data-hx-drawer')).toBe(true);
		unmount();
	});

	it.each([
		['top-left', 'toast-tl'],
		['top-right', 'toast-tr'],
		['bottom-right', 'toast-br'],
		['bottom-left', 'toast-bl']
	] as const)('renders the toast role for position %s', async (position, role) => {
		const {unmount} = renderWithProvider(
			<>
				<OpenButton id="toast"/>
				<HxToast id="toast" position={position} type="info" message="saved"/>
			</>
		);
		fireEvent.click(screen.getByText('open'));
		await waitFor(() => expect(document.querySelector('[data-hx-overlay]')).not.toBeNull());
		const content = document.querySelector<HTMLElement>('[data-hx-overlay]')!;
		expect(content.getAttribute('role')).toBe(role);
		expect(content.hasAttribute('data-hx-toast')).toBe(true);
		unmount();
	});

	it('renders an info alert with its icon, message and OK button', async () => {
		const confirm = vi.fn();
		renderWithProvider(
			<>
				<OpenButton id="alert"/>
				<HxInfoAlert id="alert" message="Saved successfully" confirm={confirm}/>
			</>
		);
		fireEvent.click(screen.getByText('open'));
		await waitFor(() => expect(document.querySelector('[data-hx-alert]')).not.toBeNull());
		const alert = document.querySelector<HTMLElement>('[data-hx-alert]')!;
		expect(alert.getAttribute('role')).toBe('alert');
		expect(alert.textContent).toContain('Saved successfully');
		expect(alert.querySelector('[data-hx-svg-icon-name="info"]')).not.toBeNull();
		const ok = screen.getByRole('button', {name: 'HxCommon.OkButton'});
		fireEvent.click(ok);
		expect(confirm).toHaveBeenCalledTimes(1);
	});

	it('renders a custom alert kind as the icon', async () => {
		renderWithProvider(
			<>
				<OpenButton id="alert"/>
				<HxAlert id="alert" kind={<span data-testid="custom-alert-icon"/>} message="custom"/>
			</>
		);
		fireEvent.click(screen.getByText('open'));
		await waitFor(() => expect(document.querySelector('[data-hx-alert]')).not.toBeNull());
		expect(document.querySelector('[data-testid="custom-alert-icon"]')).not.toBeNull();
	});

	it('falls back to the error look for an unknown alert kind', async () => {
		renderWithProvider(
			<>
				<OpenButton id="alert"/>
				<HxAlert id="alert" kind="unknown" message="fallback"/>
			</>
		);
		fireEvent.click(screen.getByText('open'));
		await waitFor(() => expect(document.querySelector('[data-hx-alert]')).not.toBeNull());
		expect(document.querySelector('[data-hx-svg-icon-name="error"]')).not.toBeNull();
	});

	it('renders the error alert icon', async () => {
		renderWithProvider(
			<>
				<OpenButton id="alert"/>
				<HxErrorAlert id="alert" message="Boom"/>
			</>
		);
		fireEvent.click(screen.getByText('open'));
		await waitFor(() => expect(document.querySelector('[data-hx-alert]')).not.toBeNull());
		expect(document.querySelector('[data-hx-svg-icon-name="error"]')).not.toBeNull();
	});
});
