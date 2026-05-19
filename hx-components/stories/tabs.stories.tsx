import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {
	Download,
	House,
	HxBadge,
	HxButton,
	HxDiv,
	HxInput,
	HxLabel,
	HxTabs,
	type HxTabsChildren,
	MagnifyingGlass,
	Upload
} from '../src';

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
 * Tabs with custom padding configuration
 */
export const CustomPadding: Story = {
	args: {
		$model: ERO.reactive({username: 'John Doe', email: 'john.doe@gmail.com'}),
		border: true,
		// paddingX: 'lg',
		// paddingT: 'lg',
		// paddingB: 'lg',
		content: [
			{
				mark: 'form',
				header: 'Form',
				body: <HxDiv style={{width: '480px'}}>
					<HxLabel text="Username"/>
					{/* @ts-expect-error ignore the type check */}
					<HxInput $field="username" placeholder="Enter username"/>
					<HxLabel text="Email"/>
					{/* @ts-expect-error ignore the type check */}
					<HxInput $field="email" placeholder="Enter email"/>
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

const ManyTabHeader = (props: { index: number }) => {
	const {index} = props;

	switch (index) {
		case 0:
		case 1:
			return <>
				<HxLabel text={`Tab ${index + 1}`}/>
				<HxLabel text={[
					<House/>, <MagnifyingGlass/>
				][index]} data-hx-margin-l="md"/>
			</>;
		case 2:
		case 3:
			return <>
				<HxLabel text={[
					<Upload/>, <Download/>
				][index - 2]} data-hx-margin-r="md"/>
				<HxLabel text={`Tab ${index + 1}`}/>
			</>;
		case 4:
			return <>
				<HxBadge size="sm" text={index * 100} color="info" data-hx-margin-r="md"/>
				<HxLabel text={`Tab ${index + 1}`}/>
			</>;
		case 5:
			return <>
				<HxBadge size="sm" text={index * 100} color="danger" data-hx-margin-r="md"/>
				<HxLabel text={`Tab ${index + 1}`}/>
			</>;
		case 6:
			return <>
				<HxLabel text={`Tab ${index + 1}`}/>
				<HxBadge size="sm" text={index * 100} color="warn" data-hx-margin-l="md"/>
			</>;
		case 7:
			return <>
				<HxLabel text={`Tab ${index + 1}`}/>
				<HxBadge size="sm" text={index * 100} color="success" data-hx-margin-l="md"/>
			</>;
	}
};
/**
 * Tabs with many items to demonstrate scrolling behavior
 */
export const ManyTabsWithBorder: Story = {
	args: {
		maxWidth: 500,
		border: true,
		content: new Array(8).fill(null).map((_, index) => ({
			mark: `tab${index + 1}`,
			header: <ManyTabHeader index={index}/>,
			body: <HxLabel text={`Content for tab ${index + 1}`}/>,
			$disabled: index >= 6,
			defaultActive: index === 2
		})) as unknown as HxTabsChildren
	}
};

export const ManyTabs: Story = {
	args: {
		maxWidth: 500,
		content: new Array(8).fill(null).map((_, index) => ({
			mark: `tab${index + 1}`,
			header: <ManyTabHeader index={index}/>,
			body: <HxLabel text={`Content for tab ${index + 1}`}/>,
			$disabled: index >= 6,
			defaultActive: index === 2
		})) as unknown as HxTabsChildren
	}
};
