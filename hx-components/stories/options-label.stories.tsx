import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFlex, HxLabel, HxOptionsLabel, type HxOptionsLabelType, HxPanel} from '../src';

const meta: Meta<HxOptionsLabelType> = {
	title: 'Components/Basic/Options Label',
	component: HxOptionsLabel,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		options: {
			name: 'Options',
			description: 'Options source: static array, sync or async function',
			control: {type: 'object'}
		},
		optionsOnLoadKey: {
			name: 'Loading Text',
			description: 'Text or i18n key for the loading state',
			control: 'text',
			table: {defaultValue: {summary: '~HxCommon.SelectOptionsOnLoad'}}
		},
		noOptionsKey: {
			name: 'No Options Text',
			description: 'Text or i18n key for the empty options state',
			control: 'text',
			table: {defaultValue: {summary: '~HxCommon.SelectNoOptions'}}
		},
		optionNotFoundKey: {
			name: 'Not Found Text',
			description: 'Text or i18n key for the option not found state',
			control: 'text',
			table: {defaultValue: {summary: '~HxCommon.SelectOptionNotFound'}}
		}
	}
};

export default meta;
type Story = StoryObj<HxOptionsLabelType>;

const options = [
	{value: 1, label: 'Odd'},
	{value: 2, label: 'Even'},
	{value: 'design', label: 'Design'},
	{value: 'engineering', label: 'Engineering'},
	{value: 'marketing', label: 'Marketing'}
];

export const SingleValue: Story = {
	name: 'Single Value',
	render: () => {
		const $model = ERO.reactive<{ value?: unknown }>({value: 1});
		return <HxPanel title="Bound value: 1">
			<HxOptionsLabel $model={$model} $field="value" options={options}/>
		</HxPanel>;
	}
};

export const MultipleValues: Story = {
	name: 'Multiple Values',
	render: () => {
		const $model = ERO.reactive<{ value?: unknown }>({value: ['design', 'marketing']});
		return <HxPanel title="Bound value: ['design', 'marketing']">
			<HxOptionsLabel $model={$model} $field="value" options={options}/>
		</HxPanel>;
	}
};

export const ValueStates: Story = {
	name: 'Value States',
	render: () => {
		const $found = ERO.reactive<{ value?: unknown }>({value: 'engineering'});
		const $someMissing = ERO.reactive<{ value?: unknown }>({value: ['design', 'unknown']});
		const $notFound = ERO.reactive<{ value?: unknown }>({value: 'hr'});
		const $noValue = ERO.reactive<{ value?: unknown }>({value: null});
		return <HxFlex direction="dir-y" gapY="sm">
			<HxPanel title="option-found">
				<HxOptionsLabel $model={$found} $field="value" options={options}/>
			</HxPanel>
			<HxPanel title="some-option-not-found (dangling separator is a known defect)">
				<HxOptionsLabel $model={$someMissing} $field="value" options={options}/>
			</HxPanel>
			<HxPanel title="option-not-found">
				<HxOptionsLabel $model={$notFound} $field="value" options={options}/>
			</HxPanel>
			<HxPanel title="no-value">
				<HxOptionsLabel $model={$noValue} $field="value" options={options}/>
			</HxPanel>
		</HxFlex>;
	}
};

export const EmptyAndLoading: Story = {
	name: 'Empty and Loading',
	render: () => {
		const $noOptions = ERO.reactive<{ value?: unknown }>({value: 1});
		const $loading = ERO.reactive<{ value?: unknown }>({value: 1});
		return <HxFlex direction="dir-y" gapY="sm">
			<HxPanel title="no-options">
				<HxOptionsLabel $model={$noOptions} $field="value" options={[]}/>
			</HxPanel>
			<HxPanel title="loading (resolves after 3 seconds)">
				<HxOptionsLabel $model={$loading} $field="value"
				                options={async () => {
					                await new Promise(resolve => setTimeout(resolve, 3000));
					                return options;
				                }}/>
			</HxPanel>
		</HxFlex>;
	}
};

export const CustomStateText: Story = {
	name: 'Custom State Text',
	render: () => {
		const $model = ERO.reactive<{ value?: unknown }>({value: 'hr'});
		return <HxFlex direction="dir-y" gapY="sm">
			<HxLabel text="Custom optionNotFoundKey applied to a not-found value"/>
			<HxOptionsLabel $model={$model} $field="value" options={options}
			                optionNotFoundKey="Value is filtered out"/>
		</HxFlex>;
	}
};
