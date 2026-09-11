import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxBadge} from '../src';

const meta: Meta<typeof HxBadge> = {
	title: 'Components/Basic/Badge',
	component: HxBadge,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['solid', 'outline', 'dashed'],
			description: 'Badge variant style',
			defaultValue: 'solid'
		},
		size: {
			control: 'select',
			options: ['sm', 'std'],
			description: 'Badge size',
			defaultValue: 'sm'
		},
		borderRadius: {
			control: 'select',
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'round'],
			description: 'Badge border radius',
			defaultValue: 'round'
		},
		color: {
			control: 'select',
			options: ['primary', 'success', 'danger', 'warn', 'info', 'waive'],
			description: 'Badge color theme'
		}
	}
};

export default meta;
type Story = StoryObj<typeof HxBadge>;

/**
 * Default badge with solid variant, small size and round border radius
 */
export const Default: Story = {
	args: {
		text: 'Default Badge'
	}
};

/**
 * All badge variants
 */
export const Variants: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
			<HxBadge text="Default - Solid"/>
			<HxBadge variant="solid" text="Solid"/>
			<HxBadge variant="outline" text="Outline"/>
			<HxBadge variant="dashed" text="Dot"/>
		</div>
	)
};

/**
 * All badge sizes
 */
export const Sizes: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
			<HxBadge text="Default - Small"/>
			<HxBadge size="sm" text="Small"/>
			<HxBadge size="std" text="Standard"/>
		</div>
	)
};

/**
 * All badge colors
 */
export const Colors: Story = {
	render: () => (<div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
		<div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
			<HxBadge text="Default - Primary"/>
			<HxBadge color="primary" text="Primary"/>
			<HxBadge color="success" text="Success"/>
			<HxBadge color="danger" text="Danger"/>
			<HxBadge color="warn" text="Warning"/>
			<HxBadge color="info" text="Info"/>
			<HxBadge color="waive" text="Waive"/>
		</div>
		<div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
			<HxBadge variant="outline" text="Default - Primary"/>
			<HxBadge variant="outline" color="primary" text="Primary"/>
			<HxBadge variant="outline" color="success" text="Success"/>
			<HxBadge variant="outline" color="danger" text="Danger"/>
			<HxBadge variant="outline" color="warn" text="Warning"/>
			<HxBadge variant="outline" color="info" text="Info"/>
			<HxBadge variant="outline" color="waive" text="Waive"/>
		</div>
		<div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
			<HxBadge variant="dashed" text="Default - Primary"/>
			<HxBadge variant="dashed" color="primary" text="Primary"/>
			<HxBadge variant="dashed" color="success" text="Success"/>
			<HxBadge variant="dashed" color="danger" text="Danger"/>
			<HxBadge variant="dashed" color="warn" text="Warning"/>
			<HxBadge variant="dashed" color="info" text="Info"/>
			<HxBadge variant="dashed" color="waive" text="Waive"/>
		</div>
	</div>)
};

/**
 * Different border radius options
 */
export const BorderRadius: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
			<HxBadge text="Default - Round"/>
			<HxBadge borderRadius="none" text="None"/>
			<HxBadge borderRadius="xs" text="XS"/>
			<HxBadge borderRadius="sm" text="SM"/>
			<HxBadge borderRadius="md" text="MD"/>
			<HxBadge borderRadius="lg" text="LG"/>
			<HxBadge borderRadius="xl" text="XL"/>
			<HxBadge borderRadius="round" text="Round"/>
		</div>
	)
};
