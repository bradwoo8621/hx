import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-ignore
import React, {useState} from 'react';
import {HxInput} from '../input';
import {HxBox, type HxBoxType} from './box';

const meta: Meta<HxBoxType> = {
	title: 'Components/Layout/Box',
	component: HxBox,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		border: {
			name: 'Show Border',
			description: 'Whether to display a border around the box',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		borderRadius: {
			name: 'Border Radius',
			description: 'Size of the border radius',
			control: {
				type: 'select'
			},
			options: ['none', 'sm', 'md', 'lg'],
			table: {
				defaultValue: {summary: 'md'}
			}
		},
		paddingX: {
			name: 'Horizontal Padding',
			description: 'Left and right padding size',
			control: {
				type: 'select'
			},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			table: {
				defaultValue: {summary: 'none'}
			}
		},
		paddingT: {
			name: 'Top Padding',
			description: 'Top padding size',
			control: {
				type: 'select'
			},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			table: {
				defaultValue: {summary: 'none'}
			}
		},
		paddingB: {
			name: 'Bottom Padding',
			description: 'Bottom padding size',
			control: {
				type: 'select'
			},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			table: {
				defaultValue: {summary: 'none'}
			}
		}
	}
};

export default meta;

type Story = StoryObj<typeof HxBox>;

export const Default: Story = {
	args: {
		children: <div>Default box container without styling</div>
	}
};

export const WithBorder: Story = {
	args: {
		border: true,
		paddingX: 'md',
		paddingT: 'md',
		paddingB: 'md',
		children: <div>Box with border and medium padding</div>
	}
};

export const BorderRadiusVariants: Story = {
	render: (args) => {
		return <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
			<HxBox {...args} border borderRadius="none" paddingX="md" paddingT="md" paddingB="md">
				<div>Border Radius: none</div>
			</HxBox>
			<HxBox {...args} border borderRadius="sm" paddingX="md" paddingT="md" paddingB="md">
				<div>Border Radius: sm (2px)</div>
			</HxBox>
			<HxBox {...args} border borderRadius="md" paddingX="md" paddingT="md" paddingB="md">
				<div>Border Radius: md (4px)</div>
			</HxBox>
			<HxBox {...args} border borderRadius="lg" paddingX="md" paddingT="md" paddingB="md">
				<div>Border Radius: lg (8px)</div>
			</HxBox>
		</div>;
	}
};

export const PaddingVariants: Story = {
	render: (args) => {
		return <div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '300px'}}>
			<HxBox {...args} border paddingX="xs" paddingT="xs" paddingB="xs">
				<div>Padding: xs (4px vertical / 8px horizontal)</div>
			</HxBox>
			<HxBox {...args} border paddingX="sm" paddingT="sm" paddingB="sm">
				<div>Padding: sm (8px vertical / 16px horizontal)</div>
			</HxBox>
			<HxBox {...args} border paddingX="md" paddingT="md" paddingB="md">
				<div>Padding: md (12px vertical / 24px horizontal)</div>
			</HxBox>
			<HxBox {...args} border paddingX="lg" paddingT="lg" paddingB="lg">
				<div>Padding: lg (16px vertical / 32px horizontal)</div>
			</HxBox>
			<HxBox {...args} border paddingX="xl" paddingT="xl" paddingB="xl">
				<div>Padding: xl (20px vertical / 40px horizontal)</div>
			</HxBox>
		</div>;
	}
};

export const CardExample: Story = {
	render: (args) => {
		return <HxBox {...args} border borderRadius="lg" paddingX="lg" paddingT="lg" paddingB="lg" style={{width: '350px'}}>
			<h3 style={{margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600}}>Card Component</h3>
			<p style={{margin: '0 0 16px 0', color: '#666', lineHeight: 1.5}}>
				This is an example of a card-style container built with HxBox component.
				It uses border, border radius, and padding props to achieve the card look.
			</p>
			<button style={{
				padding: '8px 16px',
				background: '#1890ff',
				color: 'white',
				border: 'none',
				borderRadius: '4px',
				cursor: 'pointer'
			}}>
				Action Button
			</button>
		</HxBox>;
	}
};

export const ModelPropagation: Story = {
	render: (args) => {
		const [model] = useState(() => ERO.reactive({
			user: {
				firstName: 'John',
				lastName: 'Doe'
			}
		}));

		return <div style={{width: '350px'}}>
			{/* @ts-expect-error $field type compatibility */}
			<HxBox {...args} $model={model} $field="user" border paddingX="md" paddingT="md" paddingB="md" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
				{/* $model is automatically propagated from the parent Box */}
				{/* @ts-expect-error $field detected as never, don't know why */}
				<HxInput $field="firstName" label="First Name"/>
				{/* @ts-expect-error $field detected as never, don't know why */}
				<HxInput $field="lastName" label="Last Name"/>
			</HxBox>
		</div>;
	}
};
