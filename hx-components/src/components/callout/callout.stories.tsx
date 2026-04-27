import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {MagnifyingGlass} from '../icons';
import {HxCallout} from './callout';

const meta: Meta<typeof HxCallout> = {
	title: 'Components/Basic/Callout',
	component: HxCallout,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		kind: {
			control: 'select',
			options: ['info', 'success', 'question', 'warn', 'error'],
			description: 'Callout type that determines icon and color scheme',
			defaultValue: 'info'
		},
		message: {
			control: 'text',
			description: 'Main content message displayed in the callout',
			defaultValue: 'This is a callout message'
		}
	}
};

export default meta;
type Story = StoryObj<typeof HxCallout>;

/**
 * Default info callout
 */
export const Default: Story = {
	args: {
		kind: 'info',
		message: 'This is an informational callout providing general context.'
	}
};

/**
 * All callout type variants
 */
export const Variants: Story = {
	render: () => (
		<div style={{display: 'flex', flexDirection: 'column', gap: '16px', width: '480px'}}>
			<HxCallout
				kind="info"
				message="Info callout: Provides helpful context, tips, or general information."
			/>
			<HxCallout
				kind="success"
				message="Success callout: Indicates a positive outcome, completed action, or successful operation."
			/>
			<HxCallout
				kind="question"
				message="Question callout: Asks for user input, provides guidance, or prompts for a decision."
			/>
			<HxCallout
				kind="warn"
				message="Warning callout: Alerts users to potential issues, important notices, or upcoming changes."
			/>
			<HxCallout
				kind="error"
				message="Error callout: Notifies users of failures, problems, or critical issues that require attention."
			/>
		</div>
	)
};

/**
 * Callout with custom icon instead of the default type icons
 */
export const CustomIcon: Story = {
	args: {
		kind: <MagnifyingGlass/>,
		message: 'This callout uses a custom bell icon for notification-style announcements.'
	}
};

/**
 * Callout with longer multi-line content
 */
export const LongContent: Story = {
	args: {
		kind: 'info',
		message: 'This is a longer callout message that wraps across multiple lines. It demonstrates how the callout component handles extended content, including paragraphs and detailed information. Callouts can be used to display important announcements, feature updates, documentation links, or any other content that needs to stand out from the rest of the page.'
	}
};
