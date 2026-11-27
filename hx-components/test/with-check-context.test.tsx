import {reactive, type ValueChangedEvent} from '@hx/data';
import {act} from '@testing-library/react';
import {type ReactNode, useEffect} from 'react';
import {describe, expect, it, type Mock, vi} from 'vitest';
import {
	AnyCheckScope,
	type CheckCallbackFunc,
	type CheckScope,
	type HxContext,
	HxWithCheckInput,
	ManualCheckField,
	useHxContext
} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

interface DispatchSetup {
	container: HTMLElement;
	rerender: (children: ReactNode) => void;
	unmount: () => void;
	/** dispatches through the context of the rendered provider and returns the callback */
	dispatch: (scopes?: CheckScope | Array<CheckScope>) => Mock<CheckCallbackFunc>;
}

/** hands the component context of the provider to the test, once after every render */
const ContextProbe = (props: {onContext: (context: HxContext) => void}) => {
	const {onContext} = props;
	const context = useHxContext();
	useEffect(() => {
		onContext(context);
	}, [context, onContext]);
	return (void 0);
};

/** renders children under the provider, together with the probe that exposes the context */
const renderDispatchable = (children: ReactNode): DispatchSetup => {
	const captured: Array<HxContext> = [];
	const onContext = (context: HxContext) => {
		captured.push(context);
	};
	const withProbe = (next: ReactNode) => <>
		<ContextProbe onContext={onContext}/>
		{next}
	</>;
	const result = renderWithProvider(withProbe(children));
	return {
		container: result.container,
		rerender: next => {
			result.rerender(withProbe(next));
		},
		unmount: () => {
			result.unmount();
		},
		dispatch: scopes => {
			const callback = vi.fn<CheckCallbackFunc>();
			act(() => {
				captured[0].checks.check(callback, scopes);
			});
			return callback;
		}
	};
};

describe('with-check manual dispatch', () => {
	it('runs the rule, renders its message and calls back with the error', () => {
		const model = reactive({name: ''});
		const handle = vi.fn(() => 'Required');
		const setup = renderDispatchable(<HxWithCheckInput $model={model} $field="name" alwaysKeepMessageDOM
		                                                $check={{handle}}/>);

		const callback = setup.dispatch();
		expect(handle).toHaveBeenCalledTimes(1);
		expect(callback.mock.calls).toHaveLength(1);
		expect(callback.mock.calls[0][0]).toBe(true);
		const message = queryByDataAttr(setup.container, 'data-hx-label-check-msg');
		expect(message?.textContent).toBe('Required');
		const errors = callback.mock.calls[0][1] ?? [];
		expect(errors).toHaveLength(1);
		expect(errors[0].error).toEqual({level: 'error', message: 'Required'});
		expect(errors[0].el).toBe(message);
	});

	it('calls back with false and clears the message once the rule passes', () => {
		const model = reactive({name: ''});
		let failing = true;
		const handle = vi.fn(() => failing ? 'Required' : (void 0));
		const setup = renderDispatchable(<HxWithCheckInput $model={model} $field="name" alwaysKeepMessageDOM
		                                                $check={{handle}}/>);
		setup.dispatch();
		expect(queryByDataAttr(setup.container, 'data-hx-label-check-msg')?.textContent).toBe('Required');

		failing = false;
		const callback = setup.dispatch();
		expect(callback.mock.calls).toEqual([[false]]);
		expect(queryByDataAttr(setup.container, 'data-hx-label-check-msg')?.textContent).toBe('');
	});

	it('hands the rule a change event of the manual field', () => {
		const model = reactive({name: ''});
		const paths: Array<string> = [];
		const handle = vi.fn((event: ValueChangedEvent) => {
			paths.push(`${event.pathToParent}|${event.pathToRoot}`);
			return (void 0);
		});
		const setup = renderDispatchable(<HxWithCheckInput $model={model} $field="name" $check={{handle}}/>);

		setup.dispatch();
		expect(paths).toEqual([`${ManualCheckField}|${ManualCheckField}`]);
	});

	it('stops running the rule after the component unmounts', () => {
		const model = reactive({name: ''});
		const handle = vi.fn(() => 'Required');
		const setup = renderDispatchable(<HxWithCheckInput $model={model} $field="name" $check={{handle}}/>);
		setup.unmount();
		handle.mockClear();

		const callback = setup.dispatch();
		expect(callback.mock.calls).toEqual([[false]]);
		expect(handle).not.toHaveBeenCalled();
	});

	it('keeps one handler when the parent re-renders with a new inline $check', () => {
		const model = reactive({name: ''});
		const handle = vi.fn(() => 'Required');
		const Host = () => <HxWithCheckInput $model={model} $field="name" $check={{handle}}/>;
		const setup = renderDispatchable(<Host/>);
		setup.rerender(<Host/>);
		setup.rerender(<Host/>);
		setup.rerender(<Host/>);
		handle.mockClear();

		const callback = setup.dispatch();
		expect(handle).toHaveBeenCalledTimes(1);
		expect(callback.mock.calls[0][1]).toHaveLength(1);
	});

	it('runs a scoped rule only when the dispatch names its scope or no scope', () => {
		const model = reactive({name: ''});
		const save = vi.fn(() => 'Save');
		const always = vi.fn(() => 'Always');
		const setup = renderDispatchable(<>
			<HxWithCheckInput $model={model} $field="name" $check={{scopes: ['save'], handle: save}}/>
			<HxWithCheckInput $model={model} $field="name" $check={{handle: always}}/>
		</>);

		setup.dispatch('other');
		expect(save).not.toHaveBeenCalled();
		expect(always).toHaveBeenCalledTimes(1);

		expect(setup.dispatch('save').mock.calls[0][0]).toBe(true);
		expect(save).toHaveBeenCalledTimes(1);
		expect(always).toHaveBeenCalledTimes(2);

		setup.dispatch();
		expect(save).toHaveBeenCalledTimes(2);
		expect(always).toHaveBeenCalledTimes(3);
	});

	it('runs a rule whose scopes contain AnyCheckScope on every dispatch', () => {
		const model = reactive({name: ''});
		const handle = vi.fn(() => 'Any');
		const setup = renderDispatchable(<HxWithCheckInput $model={model} $field="name"
		                                                $check={{scopes: ['other', AnyCheckScope], handle}}/>);

		setup.dispatch('other');
		setup.dispatch('save');
		setup.dispatch(['nothing', 'else']);
		expect(handle).toHaveBeenCalledTimes(3);
	});

	it('runs every rule when the dispatch array contains AnyCheckScope', () => {
		const model = reactive({name: ''});
		const save = vi.fn(() => 'Save');
		const load = vi.fn(() => 'Load');
		const setup = renderDispatchable(<>
			<HxWithCheckInput $model={model} $field="name" $check={{scopes: ['save'], handle: save}}/>
			<HxWithCheckInput $model={model} $field="name" $check={{scopes: ['load'], handle: load}}/>
		</>);

		expect(setup.dispatch(['nothing', AnyCheckScope]).mock.calls[0][0]).toBe(true);
		expect(save).toHaveBeenCalledTimes(1);
		expect(load).toHaveBeenCalledTimes(1);
	});
});
