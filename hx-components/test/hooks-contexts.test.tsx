import {reactive} from '@hx/data';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {StrictMode, useEffect, useLayoutEffect, type ReactNode} from 'react';
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

	it('reaches the forwarded ref when the element is attached, before effects run', () => {
		const extRef = {current: null as HTMLDivElement | null};
		const seenInLayoutEffect: Array<HTMLDivElement | null> = [];
		const Probe = () => {
			const ref = useDualRef<HTMLDivElement>(extRef);
			useLayoutEffect(() => {
				seenInLayoutEffect.push(extRef.current);
			});
			return <div data-testid="target" ref={ref}/>;
		};
		renderWithProvider(<Probe/>);
		expect(seenInLayoutEffect).toEqual([screen.getByTestId('target')]);
	});

	it('clears the forwarded ref when the element is detached', () => {
		const extRef = {current: null as HTMLDivElement | null};
		const Probe = () => {
			const ref = useDualRef<HTMLDivElement>(extRef);
			return <div data-testid="target" ref={ref}/>;
		};
		const result = renderWithProvider(<Probe/>);
		expect(extRef.current).toBe(screen.getByTestId('target'));
		result.unmount();
		expect(extRef.current).toBeNull();
	});

	it('follows an element the component renders conditionally', () => {
		const extRef = {current: null as HTMLDivElement | null};
		const Probe = (props: {show: boolean}) => {
			const ref = useDualRef<HTMLDivElement>(extRef);
			return props.show ? <div data-testid="target" ref={ref}/> : (void 0);
		};
		const result = renderWithProvider(<Probe show={false}/>);
		expect(extRef.current).toBeNull();
		result.rerender(<Probe show={true}/>);
		expect(extRef.current).toBe(screen.getByTestId('target'));
		result.rerender(<Probe show={false}/>);
		expect(extRef.current).toBeNull();
	});

	it('hands the element to a forwarded ref that changes while the element is mounted', () => {
		const first = {current: null as HTMLDivElement | null};
		const second = {current: null as HTMLDivElement | null};
		const Probe = (props: {target: typeof first}) => {
			const ref = useDualRef<HTMLDivElement>(props.target);
			return <div data-testid="target" ref={ref}/>;
		};
		const result = renderWithProvider(<Probe target={first}/>);
		expect(first.current).toBe(screen.getByTestId('target'));
		result.rerender(<Probe target={second}/>);
		expect(second.current).toBe(screen.getByTestId('target'));
	});

	it('notifies a callback ref once when the element is attached and once when it is detached', () => {
		const callbackRef = vi.fn();
		const Probe = () => {
			const ref = useDualRef<HTMLDivElement>(callbackRef);
			return <div data-testid="target" ref={ref}/>;
		};
		const result = renderWithProvider(<Probe/>);
		expect(callbackRef.mock.calls).toEqual([[screen.getByTestId('target')]]);
		result.unmount();
		expect(callbackRef).toHaveBeenCalledTimes(2);
		expect(callbackRef.mock.calls[1]).toEqual([null]);
	});

	it('keeps the single notification under StrictMode', () => {
		const callbackRef = vi.fn();
		const Probe = () => {
			const ref = useDualRef<HTMLDivElement>(callbackRef);
			return <div data-testid="target" ref={ref}/>;
		};
		renderWithProvider(<StrictMode><Probe/></StrictMode>);
		expect(callbackRef).toHaveBeenCalledTimes(1);
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
