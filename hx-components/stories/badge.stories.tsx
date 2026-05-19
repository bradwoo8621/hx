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
			<HxBadge variant="solid" color="primary" text="Solid"/>
			<HxBadge variant="outline" color="primary" text="Outline"/>
			<HxBadge variant="dashed" color="primary" text="Dot"/>
		</div>
	)
};

/**
 * All badge sizes
 */
export const Sizes: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
			<HxBadge size="sm" color="primary" text="Small"/>
			<HxBadge size="std" color="primary" text="Standard"/>
		</div>
	)
};

/**
 * All badge colors
 */
export const Colors: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
			<HxBadge color="primary" text="Primary"/>
			<HxBadge color="success" text="Success"/>
			<HxBadge color="danger" text="Danger"/>
			<HxBadge color="warn" text="Warning"/>
			<HxBadge color="info" text="Info"/>
			<HxBadge color="waive" text="Waive"/>
		</div>
	)
};

/**
 * Different border radius options
 */
export const BorderRadius: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
			<HxBadge borderRadius="none" color="primary" text="None"/>
			<HxBadge borderRadius="xs" color="primary" text="XS"/>
			<HxBadge borderRadius="sm" color="primary" text="SM"/>
			<HxBadge borderRadius="md" color="primary" text="MD"/>
			<HxBadge borderRadius="lg" color="primary" text="LG"/>
			<HxBadge borderRadius="xl" color="primary" text="XL"/>
			<HxBadge borderRadius="round" color="primary" text="Round"/>
		</div>
	)
};

/**
 * Dot variant examples
 */
export const DotVariants: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
			<HxBadge variant="dashed" color="success" text="Active"/>
			<HxBadge variant="dashed" color="danger" text="Error"/>
			<HxBadge variant="dashed" color="warn" text="Pending"/>
			<HxBadge variant="dashed" color="info" text="In Progress"/>
		</div>
	)
};

/**
 * Outline variant examples
 */
export const OutlineVariants: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
			<HxBadge variant="outline" color="primary" text="Draft"/>
			<HxBadge variant="outline" color="success" text="Published"/>
			<HxBadge variant="outline" color="danger" text="Archived"/>
		</div>
	)
};
