import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-ignore
import React from 'react';
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
			options: ['solid', 'soft', 'surface', 'outline', 'ghost'],
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
		},
		children: {
			name: 'Button Text',
			control: 'text',
			defaultValue: 'Button'
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
		<HxButton {...args} color="primary">Primary</HxButton>
		<HxButton {...args} color="success">Success</HxButton>
		<HxButton {...args} color="warn">Warning</HxButton>
		<HxButton {...args} color="danger">Danger</HxButton>
		<HxButton {...args} color="info">Info</HxButton>
		<HxButton {...args} color="waive">Waive</HxButton>
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
		<HxButton {...args} various="solid">Solid</HxButton>
		<HxButton {...args} various="soft">Soft</HxButton>
		<HxButton {...args} various="surface">Surface</HxButton>
		<HxButton {...args} various="outline">Outline</HxButton>
		<HxButton {...args} various="ghost">Ghost</HxButton>
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
		<HxButton {...args} color="primary" $disabled>Primary (Disabled)</HxButton>
		<HxButton {...args} color="success" $disabled>Success (Disabled)</HxButton>
		<HxButton {...args} color="danger" $disabled>Danger (Disabled)</HxButton>
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
		const variants = ['solid', 'soft', 'surface', 'outline', 'ghost'] as const;

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
						{colors.map(color => (
							<HxButton key={color} {...args} color={color} various={variant}>
								{color}
							</HxButton>
						))}
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
