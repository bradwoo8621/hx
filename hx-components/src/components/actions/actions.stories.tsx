import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxButton} from '../button';
import {HxLabel} from '../label';
import {HxPanel} from '../panel';
import {HxActions} from './actions';

const meta: Meta<typeof HxActions> = {
	title: 'Components/Basic/Actions',
	component: HxActions,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		leading: {
			name: 'Leading Trigger',
			description: 'Trigger element for the actions popup, can be string, custom element or action array'
		},
		tailing: {
			name: 'Tailing Content',
			description: 'Content to display in the popup dropdown (currently under development)'
		},
		zIndex: {
			name: 'Z-Index',
			description: 'Stack order of the popup',
			control: 'number'
		}
	}
};

export default meta;

type Story = StoryObj<typeof HxActions>;

/**
 * Basic usage examples for HxActions component
 * Note: Dropdown content rendering is currently under development, click will not open popup yet
 */
export const Basic: Story = {
	render: () => {
		const model = ERO.reactive({});

		return (
			<div style={{width: '600px', display: 'flex', flexDirection: 'column', gap: '32px'}}>
				<HxPanel title="No Action and More (String Trigger)" bodyPaddingT="lg" bodyPaddingB="lg">
					<HxActions
						$model={model}
						color="waive" various="outline"
						tailing={<HxButton text="Action #1"/>}
						gCols={12}
						gJustifySelf="start"/>
				</HxPanel>

				<HxPanel title="No Action and More (String Trigger)" bodyPaddingT="lg" bodyPaddingB="lg">
					<HxActions
						$model={model}
						leading="String and More"
						tailing={<HxButton text="Action #1"/>}
						gCols={12}
						gJustifySelf="start"/>
				</HxPanel>

				<HxPanel title="No Action and More (HxLabel Trigger)" bodyPaddingT="lg" bodyPaddingB="lg">
					<HxActions
						$model={model}
						color="success" various="outline"
						leading={<HxLabel text="HxLabel and More"/>}
						tailing={<HxButton text="Action #1"/>}
						gCols={12}
						gJustifySelf="start"/>
				</HxPanel>

				<HxPanel title="One Action and More" bodyPaddingT="lg" bodyPaddingB="lg">
					<HxActions
						$model={model}
						color="info"
						leading={<HxButton text="Action #0"/>}
						tailing={<HxButton text="Action #1"/>}
						gCols={12}
						gJustifySelf="start"/>
				</HxPanel>

				<HxPanel title="2 Actions and More" bodyPaddingT="lg" bodyPaddingB="lg">
					<HxActions
						$model={model}
						color="warn" various="outline"
						leading={[
							<HxButton text="Action #0.1"/>,
							<HxButton text="Action #0.2"/>
						]}
						tailing={<HxButton text="Action #1"/>}
						gCols={12}
						gJustifySelf="start"/>
				</HxPanel>
			</div>
		);
	}
};
