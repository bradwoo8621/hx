import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxButton} from '../button';
import {HxInput} from '../input';
import {HxLabel} from '../label';
import {HxDiv} from '../penetrable-basic';
import {HxTabs} from './tabs';
import type {HxTabsChildren} from './types';

const meta: Meta<typeof HxTabs> = {
	title: 'Components/Layout/Tabs',
	component: HxTabs,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		border: {
			control: 'boolean',
			description: 'Whether to show border around the tabs container',
			defaultValue: false
		},
		borderRadius: {
			control: 'select',
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'round'],
			description: 'Border radius size for the tabs container',
			defaultValue: 'md'
		},
		paddingX: {
			control: 'select',
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			description: 'Horizontal padding for the tab content area',
			defaultValue: 'xl'
		},
		paddingT: {
			control: 'select',
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			description: 'Top padding for the tab content area',
			defaultValue: 'xl'
		},
		paddingB: {
			control: 'select',
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			description: 'Bottom padding for the tab content area',
			defaultValue: 'xl'
		}
	}
};

export default meta;
type Story = StoryObj<typeof HxTabs>;

const sampleTabs: HxTabsChildren = [
	{
		mark: 'tab1',
		header: 'Profile',
		body: <div style={{width: '480px'}}>
			<HxLabel
				text="This is your profile information section. You can view and edit your personal details here."/>
		</div>
	},
	{
		mark: 'tab2',
		header: 'Settings',
		body: <div style={{width: '480px'}}>
			<HxLabel text="Customize your application preferences and account settings in this section."/>
		</div>
	},
	{
		mark: 'tab3',
		header: 'Notifications',
		body: <div style={{width: '480px'}}>
			<HxLabel text="Manage your notification preferences and communication settings here."/>
		</div>
	}
];

/**
 * Basic tabs with default configuration
 */
export const Default: Story = {
	args: {
		content: sampleTabs
	}
};

/**
 * Tabs with custom default active tab (second tab active by default)
 */
export const DefaultActiveTab: Story = {
	args: {
		content: sampleTabs.map((tab, index) => ({
			...tab,
			defaultActive: index === 1
		})) as HxTabsChildren
	}
};

/**
 * Tabs with disabled tab option
 */
export const DisabledTabs: Story = {
	args: {
		content: [
			...sampleTabs.slice(0, 2),
			{
				...sampleTabs[2],
				$disabled: true,
				header: 'Notifications (Disabled)'
			}
		] as unknown as HxTabsChildren
	}
};

/**
 * Tabs with border around content area
 */
export const Bordered: Story = {
	args: {
		border: true,
		content: sampleTabs
	}
};

/**
 * Tabs with custom padding configuration
 */
export const CustomPadding: Story = {
	args: {
		border: true,
		paddingX: 'lg',
		paddingT: 'lg',
		paddingB: 'lg',
		content: [
			{
				mark: 'form',
				header: 'Form',
				body: <HxDiv style={{width: '480px'}}>
					<HxLabel text="Username"/>
					{/* @ts-expect-error ignore the type check */}
					<HxInput placeholder="Enter username"/>
					<HxLabel text="Email"/>
					{/* @ts-expect-error ignore the type check */}
					<HxInput placeholder="Enter email" style={{marginTop: '16px'}}/>
					<HxButton text="Save" style={{marginTop: '24px'}}/>
				</HxDiv>
			},
			{
				mark: 'preview',
				header: 'Preview',
				body: <HxLabel text="This is the preview of your form submission."/>
			}
		]
	}
};

/**
 * Tabs with custom border radius
 */
export const CustomBorderRadius: Story = {
	args: {
		border: true,
		borderRadius: 'lg',
		content: sampleTabs
	}
};

/**
 * Tabs with many items to demonstrate scrolling behavior
 */
export const ManyTabs: Story = {
	args: {
		border: true,
		content: new Array(8).fill(null).map((_, index) => ({
			mark: `tab${index + 1}`,
			header: `Tab ${index + 1}`,
			content: <HxLabel text={`Content for tab ${index + 1}`}/>
		})) as unknown as HxTabsChildren
	}
};
