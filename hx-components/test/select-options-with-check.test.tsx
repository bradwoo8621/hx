import {reactive} from '@hx/data';
import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {
	HxSelectOptionsHolder,
	HxSelectOptionsProvider,
	HxWithCheckInput,
	useSelectOptions,
	type HxObject
} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

const OptionsProbe = (props: { $model: HxObject<{ value?: unknown }> }) => {
	const optionsRef = useSelectOptions({$model: props.$model, $field: 'value'});
	if (!optionsRef.current.loaded) {
		return <span data-testid="options">loading</span>;
	}
	return <span data-testid="options">
		{optionsRef.current.options.map(option => `${option.value}:${option.label}`).join(',')}
	</span>;
};

describe('select options provider', () => {
	it('loads static options through the holder', async () => {
		const model = reactive<{ value?: unknown }>({});
		renderWithProvider(
			<HxSelectOptionsProvider>
				<OptionsProbe $model={model}/>
				<HxSelectOptionsHolder $model={model}
				                       options={[{value: 'a', label: 'Alpha'}, {value: 'b', label: 'Beta'}]}/>
			</HxSelectOptionsProvider>
		);
		await waitFor(() =>
			expect(screen.getByTestId('options').textContent).toBe('a:Alpha,b:Beta')
		);
	});

	it('loads options from an async function', async () => {
		const model = reactive<{ value?: unknown }>({});
		renderWithProvider(
			<HxSelectOptionsProvider>
				<OptionsProbe $model={model}/>
				<HxSelectOptionsHolder $model={model}
				                       options={async () => [{value: 1, label: 'One'}]}/>
			</HxSelectOptionsProvider>
		);
		await waitFor(() => expect(screen.getByTestId('options').textContent).toBe('1:One'));
	});

	it('clears the value when dependent options change and onOptionsChange is clear', async () => {
		const model = reactive<{ value?: unknown, dependent: string }>({value: 'a', dependent: 'x'});
		renderWithProvider(
			<HxSelectOptionsProvider>
				<OptionsProbe $model={model}/>
				<HxSelectOptionsHolder $model={model}
				                       options={() => [{value: model.dependent, label: model.dependent}]}
				                       optionsDependsOn="dependent"
				                       onOptionsChange="clear"/>
			</HxSelectOptionsProvider>
		);
		await waitFor(() => expect(screen.getByTestId('options').textContent).toBe('x:x'));
		await act(async () => {
			model.dependent = 'y';
		});
		await waitFor(() => expect(model.value == null).toBe(true));
	});
});

describe('HxWithCheck', () => {
	it('shows an error message after a change', async () => {
		const model = reactive({name: ''});
		const {container} = renderWithProvider(
			<HxWithCheckInput $model={model} $field="name" emitChangeDelay={0}
			                  $check={{handle: () => 'Required'}}/>
		);
		expect(queryByDataAttr(container, 'data-hx-with-check')).not.toBeNull();
		fireEvent.change(queryByDataAttr(container, 'data-hx-input')!, {target: {value: 'x'}});
		await waitFor(() => expect(queryByDataAttr(container, 'data-hx-label-check-msg')).not.toBeNull());
		expect(queryByDataAttr(container, 'data-hx-label-check-msg')!.textContent).toBe('Required');
	});

	it('maps a warn level result to the warn color', async () => {
		const model = reactive({name: ''});
		const {container} = renderWithProvider(
			<HxWithCheckInput $model={model} $field="name" emitChangeDelay={0}
			                  $check={{handle: () => ({level: 'warn', message: 'Weak'})}}/>
		);
		fireEvent.change(queryByDataAttr(container, 'data-hx-input')!, {target: {value: 'x'}});
		await waitFor(() => expect(queryByDataAttr(container, 'data-hx-label-check-msg')).not.toBeNull());
		const message = queryByDataAttr(container, 'data-hx-label-check-msg')!;
		expect(message.textContent).toBe('Weak');
		expect(message.getAttribute('data-hx-color')).toBe('warn');
	});

	it('keeps the message element when alwaysKeepMessageDOM is set', () => {
		const model = reactive({name: 'x'});
		const {container} = renderWithProvider(
			<HxWithCheckInput $model={model} $field="name" alwaysKeepMessageDOM/>
		);
		const message = queryByDataAttr(container, 'data-hx-label-check-msg');
		expect(message).not.toBeNull();
		expect(message!.textContent).toBe('');
	});

	it('drops the message when the check passes', async () => {
		const model = reactive({name: 'x'});
		const {container} = renderWithProvider(
			<HxWithCheckInput $model={model} $field="name" emitChangeDelay={0}
			                  $check={{handle: () => model.name === 'bad' ? 'Bad' : undefined}}/>
		);
		fireEvent.change(queryByDataAttr(container, 'data-hx-input')!, {target: {value: 'bad'}});
		await waitFor(() => expect(queryByDataAttr(container, 'data-hx-label-check-msg')).not.toBeNull());
		fireEvent.change(queryByDataAttr(container, 'data-hx-input')!, {target: {value: 'good'}});
		await waitFor(() => expect(queryByDataAttr(container, 'data-hx-label-check-msg')).toBeNull());
	});
});
