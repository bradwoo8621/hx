import {reactive} from '@hx/data';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {useEffect, type ReactNode} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
	HxContextProvider,
	HxLabel,
	HxLC,
	StdHxLanguages,
	useDataMonitor,
	useDelayedFunc,
	useDualRef,
	useForceUpdate,
	useFuncResultRef,
	useHxContext,
	type UseDataMonitorOptions
} from '../src';
import {renderWithProvider} from './test-utils';

afterEach(() => {
	HxLC.switchTo('en');
});

describe('useForceUpdate', () => {
	it('re-renders only when the returned dispatch is called', () => {
		let renders = 0;
		let forceUpdate: (() => void) | undefined;
		const Probe = () => {
			renders += 1;
			forceUpdate = useForceUpdate();
			return <span>{renders}</span>;
		};
		renderWithProvider(<Probe/>);
		expect(renders).toBe(1);
		act(() => forceUpdate!());
		expect(renders).toBe(2);
	});
});

describe('useFuncResultRef', () => {
	it('runs the factory only once', () => {
		const factory = vi.fn(() => ({value: 1}));
		let refA: { current: { value: number } } | undefined;
		const Probe = () => {
			refA = useFuncResultRef(factory);
			return <span>{refA.current.value}</span>;
		};
		const {rerender} = renderWithProvider(<Probe/>);
		rerender(<Probe/>);
		rerender(<Probe/>);
		expect(factory).toHaveBeenCalledTimes(1);
		expect(refA!.current.value).toBe(1);
	});
});

describe('useDualRef', () => {
	it('assigns both object and callback refs', () => {
		const objectRef = {current: null as HTMLDivElement | null};
		const callbackRef = vi.fn();
		const Probe = () => {
			const ref = useDualRef<HTMLDivElement>(callbackRef);
			useEffect(() => {
				objectRef.current = ref.current;
			});
			return <div ref={ref}/>;
		};
		renderWithProvider(<Probe/>);
		expect(callbackRef).toHaveBeenCalled();
		expect(objectRef.current).not.toBeNull();
	});
});

describe('useDelayedFunc', () => {
	it('runs a delayed function and replaces the pending one by key', async () => {
		const calls: Array<string> = [];
		const Probe = () => {
			const {delay, clear} = useDelayedFunc(20);
			return <>
				<button onClick={() => delay('a', () => { calls.push('first'); })}>first</button>
				<button onClick={() => delay('a', () => { calls.push('second'); })}>second</button>
				<button onClick={() => clear('a')}>clear</button>
			</>;
		};
		renderWithProvider(<Probe/>);
		fireEvent.click(screen.getByText('first'));
		fireEvent.click(screen.getByText('second'));
		await waitFor(() => expect(calls).toEqual(['second']));

		fireEvent.click(screen.getByText('first'));
		fireEvent.click(screen.getByText('clear'));
		await new Promise(resolve => setTimeout(resolve, 40));
		expect(calls).toEqual(['second']);
	});

	it('clears all pending functions', async () => {
		const calls: Array<string> = [];
		const Probe = () => {
			const {delay, clear} = useDelayedFunc(20);
			return <>
				<button onClick={() => {
					delay('a', () => { calls.push('a'); });
					delay('b', () => { calls.push('b'); });
				}}>schedule
				</button>
				<button onClick={() => clear()}>clear all</button>
			</>;
		};
		renderWithProvider(<Probe/>);
		fireEvent.click(screen.getByText('schedule'));
		fireEvent.click(screen.getByText('clear all'));
		await new Promise(resolve => setTimeout(resolve, 40));
		expect(calls).toEqual([]);
	});
});

const MonitorProbe = (props: UseDataMonitorOptions<object>) => {
	const {visible, disabled, readonly} = useDataMonitor(props);
	return <span data-testid="state">{`${visible}/${disabled}/${readonly}`}</span>;
};

describe('useDataMonitor', () => {
	it('uses boolean defaults', () => {
		renderWithProvider(<MonitorProbe/>);
		expect(screen.getByTestId('state').textContent).toBe('true/false/false');
	});

	it('accepts boolean and function values', () => {
		renderWithProvider(<MonitorProbe $visible={false} $disabled $readonly/>);
		expect(screen.getByTestId('state').textContent).toBe('false/true/true');

		renderWithProvider(<MonitorProbe $visible={() => false}/>);
	});

	it('reacts to monitored model changes', async () => {
		const model = reactive({enabled: false});
		renderWithProvider(
			<MonitorProbe
				$model={model}
				$visible={{on: 'enabled', handle: () => model.enabled, default: () => model.enabled}}
				$disabled={{on: 'enabled', handle: () => !model.enabled, default: () => !model.enabled}}
			/>
		);
		expect(screen.getByTestId('state').textContent).toBe('false/true/false');

		await act(async () => {
			model.enabled = true;
		});
		await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('true/false/false'));
	});
});

describe('HxContextProvider', () => {
	it('wraps children in the hx root and sets the default theme and language', async () => {
		const {container} = renderWithProvider(<span>child</span>);
		const root = container.querySelector('[data-hx-root]')!;
		expect(root).not.toBeNull();
		expect(root.textContent).toBe('child');
		await waitFor(() => {
			expect(root.getAttribute('data-hx-theme')).toBe('light');
			expect(root.getAttribute('data-hx-language')).toBe('en');
		});
	});

	it('sets the html and body reset attributes by default', () => {
		renderWithProvider(<span>child</span>);
		expect(document.documentElement.hasAttribute('data-hx-reset-styles')).toBe(true);
		expect(document.body.hasAttribute('data-hx-reset-styles')).toBe(true);
	});

	it('can turn off the global reset attributes', () => {
		render(<span>child</span>, {
			wrapper: (props: { children: ReactNode }) =>
				<HxContextProvider resetHtmlStyles={false} resetBodyStyles={false}>{props.children}</HxContextProvider>
		});
		expect(document.documentElement.hasAttribute('data-hx-reset-styles')).toBe(false);
		expect(document.body.hasAttribute('data-hx-reset-styles')).toBe(false);
	});

	it('switches theme and language through the context', async () => {
		const Probe = () => {
			const context = useHxContext();
			return <>
				<button onClick={() => context.theme.dark()}>dark</button>
				<button onClick={() => context.language.switchTo('de')}>german</button>
			</>;
		};
		const {container} = renderWithProvider(<Probe/>);
		const root = container.querySelector('[data-hx-root]')!;
		fireEvent.click(screen.getByText('dark'));
		await waitFor(() => expect(root.getAttribute('data-hx-theme')).toBe('dark'));
		fireEvent.click(screen.getByText('german'));
		await waitFor(() => expect(root.getAttribute('data-hx-language')).toBe('de'));
	});

	it('renders a label translated by the active language package', async () => {
		StdHxLanguages.install('en', {greeting: 'Hello'});
		HxLC.switchTo('en');
		renderWithProvider(<HxLabel text="~greeting"/>);
		expect(screen.getByText('Hello')).toBeTruthy();
		StdHxLanguages.uninstall('en');
	});
});
