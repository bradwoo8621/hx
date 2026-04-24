import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {useState} from 'react';
import {HxLabel, type HxLabelType} from './label';

const meta: Meta<HxLabelType> = {
	title: 'Components/Basic/Label',
	component: HxLabel,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		text: {
			name: 'Text Content',
			description: 'Static text content or i18n key starting with ~',
			control: 'text'
		},
		color: {
			name: 'Color',
			description: 'Text color theme',
			control: {
				type: 'select'
			},
			options: ['primary', 'success', 'warn', 'danger', 'info', 'waive'],
			table: {
				defaultValue: {summary: 'default'}
			}
		},
		opaque: {
			name: 'Opaque Background',
			description: 'Whether to use solid background',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		borderRadius: {
			name: 'Border Radius',
			description: 'Size of border radius',
			control: {
				type: 'select'
			},
			options: ['none', 'sm', 'md', 'lg'],
			table: {
				defaultValue: {summary: 'none'}
			}
		},
		role: {
			name: 'Role',
			description: 'Special role identifier for label usage',
			control: {
				type: 'select'
			},
			options: ['check-msg']
		}
	}
};

export default meta;

type Story = StoryObj<typeof HxLabel>;

export const Default: Story = {
	args: {
		text: 'Default Label Text'
	}
};

export const ColorVariants: Story = {
	render: (args) => {
		return <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
			<HxLabel {...args} text="Primary Color" color="primary" paddingX="lg"/>
			<HxLabel {...args} text="Success Color" color="success" paddingX="lg"/>
			<HxLabel {...args} text="Warning Color" color="warn" paddingX="lg"/>
			<HxLabel {...args} text="Danger Color" color="danger" paddingX="lg"/>
			<HxLabel {...args} text="Info Color" color="info" paddingX="lg"/>
			<HxLabel {...args} text="Waive Color" color="waive" paddingX="lg"/>
		</div>;
	}
};

export const OpaqueBackground: Story = {
	render: (args) => {
		return <div style={{
			display: 'flex',
			flexDirection: 'column',
			gap: '16px',
			width: '300px',
			padding: '20px',
			background: '#f5f5f5'
		}}>
			<HxLabel {...args} text="Opaque Background (default)" color="primary" opaque borderRadius="sm"
			         paddingX="lg"/>
			<HxLabel {...args} text="Transparent Background" color="primary" opaque={false} paddingX="lg"/>
			<HxLabel {...args} text="Opaque with Large Radius" color="success" opaque borderRadius="lg" paddingX="lg"/>
		</div>;
	}
};

export const BorderRadiusVariants: Story = {
	render: (args) => {
		return <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
			<HxLabel {...args} text="No Border Radius" color="primary" opaque borderRadius="none" paddingX="lg"
			         paddingY="xs"/>
			<HxLabel {...args} text="Small Radius (sm)" color="primary" opaque borderRadius="sm" paddingX="lg"
			         paddingY="xs"/>
			<HxLabel {...args} text="Medium Radius (md)" color="primary" opaque borderRadius="md" paddingX="lg"
			         paddingY="xs"/>
			<HxLabel {...args} text="Large Radius (lg)" color="primary" opaque borderRadius="lg" paddingX="lg"
			         paddingY="xs"/>
		</div>;
	}
};

export const ReactiveLabel: Story = {
	render: (args) => {
		const [model] = useState(() => ERO.reactive({
			user: {
				name: 'John Doe',
				email: 'john@example.com'
			}
		}));

		return <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
			<HxLabel {...args} text="User Name: "/>
			<HxLabel {...args} $model={model} $field="user.name" color="primary"/>
			<br/>
			<HxLabel {...args} text="Email: "/>
			<HxLabel {...args} $model={model} $field="user.email" color="info"/>
		</div>;
	}
};

export const CheckMessageRole: Story = {
	render: (args) => {
		return <div style={{width: '300px'}}>
			<HxLabel {...args} text="This is an error message for form validation" data-hx-label-check-msg=""
			         color="danger"/>
		</div>;
	}
};
