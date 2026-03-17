import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-ignore
import React, {useEffect, useState} from 'react';
import {StdHxLanguages, useHxLanguage} from '../../contexts';
import {useForceUpdate} from '../../hooks';
import {HxButton} from './index';

const meta: Meta<typeof HxButton> = {
	title: 'Components/Button',
	component: HxButton,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		color: {
			name: 'Color',
			description: 'Button color theme',
			control: {type: 'select'},
			options: ['primary', 'success', 'warn', 'danger', 'info', 'waive'],
			table: {
				defaultValue: {summary: 'primary'}
			}
		},
		various: {
			name: 'Variant',
			description: 'Button visual style variant',
			control: {type: 'select'},
			options: ['solid', 'outline', 'ghost'],
			table: {
				defaultValue: {summary: 'solid'}
			}
		},
		$model: {
			name: 'Data Model',
			control: 'text',
			table: {disable: true}
		},
		$field: {
			name: 'Field name of Data Model',
			control: 'text',
			table: {disable: true}
		},
		$visible: {
			name: 'Visible',
			control: 'boolean'
		},
		$disabled: {
			name: 'Disabled',
			control: 'boolean'
		},
		onClick: {
			action: 'clicked',
			table: {
				disable: true
			}
		}
	}
};

export default meta;

type Story = StoryObj<typeof HxButton>;

export const Default: Story = {
	args: {
		$model: ERO.reactive({}),
		// @ts-ignore
		$field: '',
		children: 'Default Button',
		onClick: console.log
	}
};

export const Colors: Story = {
	render: (args) => <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
		<HxButton {...args} color="primary" text="Primary"/>
		<HxButton {...args} color="success" text="Success"/>
		<HxButton {...args} color="warn" text="Warning"/>
		<HxButton {...args} color="danger" text="Danger"/>
		<HxButton {...args} color="info" text="Info"/>
		<HxButton {...args} color="waive" text="Waive"/>
	</div>,
	args: {
		$model: ERO.reactive({}),
		// @ts-ignore
		$field: '',
		onClick: console.log
	}
};

export const Variants: Story = {
	render: (args) => <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
		<HxButton {...args} various="solid" text="Solid"/>
		<HxButton {...args} various="outline" text="Outline"/>
		<HxButton {...args} various="ghost" text="Ghost"/>
	</div>,
	args: {
		$model: ERO.reactive({}),
		// @ts-ignore
		$field: '',
		color: 'primary',
		onClick: console.log
	}
};

export const Disabled: Story = {
	render: (args) => <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
		<HxButton {...args} color="primary" $disabled text="Primary (Disabled)"/>
		<HxButton {...args} color="success" $disabled text="Success (Disabled)"/>
		<HxButton {...args} color="danger" $disabled text="Danger (Disabled)"/>
	</div>,
	args: {
		$model: ERO.reactive({}),
		// @ts-ignore
		$field: '',
		onClick: console.log
	}
};

export const AllCombinations: Story = {
	render: (args) => {
		const colors = ['primary', 'success', 'warn', 'danger', 'info', 'waive'] as const;
		const variants = ['solid', 'outline', 'ghost'] as const;
		const disabled = [true, false] as const;

		return <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
			{variants.map(variant => (
				<div key={variant} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
					<h4 style={{
						margin: 0,
						textTransform: 'capitalize',
						fontSize: '14px',
						fontWeight: 600
					}}>{variant}</h4>
					<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
						{colors.map(color => {
							return disabled.map($disabled => {
								return <HxButton key={`${color}-${variant}-${$disabled}`} {...args}
								                 color={color} various={variant} $disabled={$disabled}
								                 text={color}/>;
							});
						})}
					</div>
				</div>
			))}
		</div>;
	},
	args: {
		$model: ERO.reactive({}),
		// @ts-ignore
		$field: '',
		onClick: console.log
	}
};

// Internationalization Example using StdHxLanguages.install
const I18nTestComponent = () => {
	const language = useHxLanguage();

	const forceUpdate = useForceUpdate();
	useEffect(() => {
		const onLanguageChange = () => forceUpdate();
		language.on(onLanguageChange);
		return () => {
			language.off(onLanguageChange);
		};
	}, [forceUpdate]);

	const $model = ERO.reactive({});

	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center'}}>
			<div style={{display: 'flex', gap: '12px', marginBottom: '20px'}}>
				<HxButton $model={$model}
				          onClick={() => language.switchTo('en')}
				          text="English"/>
				<HxButton $model={$model}
				          onClick={() => language.switchTo('zh-CN')}
				          text="中文"/>
			</div>

			<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
				<HxButton $model={$model} color="primary" text="~button.submit"/>
				<HxButton $model={$model} color="success" text="~button.save"/>
				<HxButton $model={$model} color="warn" text="~button.cancel"/>
			</div>

			<div style={{fontSize: '14px', color: '#666', marginTop: '10px'}}>
				Current language: {language.current()}
			</div>
		</div>
	);
};

// Install languages before rendering
StdHxLanguages.install('en', {
	button: {
		submit: 'Submit',
		cancel: 'Cancel',
		save: 'Save'
	}
});

StdHxLanguages.install('zh-CN', {
	button: {
		submit: '提交',
		cancel: '取消',
		save: '保存'
	}
});

export const Internationalization: Story = {
	render: (_args) => <I18nTestComponent/>,
	args: {
		$model: ERO.reactive({}),
		// @ts-ignore
		$field: '',
		onClick: console.log
	}
};
