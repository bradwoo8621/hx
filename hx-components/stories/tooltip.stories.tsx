import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxButton, HxTooltip, type HxTooltipPosition} from '../src';

const meta: Meta<typeof HxTooltip> = {
	title: 'Components/Overlay/Tooltip',
	component: HxTooltip,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded'
	}
};

export default meta;

type Story = StoryObj<typeof HxTooltip>;

const ALL_POSITIONS: Array<HxTooltipPosition | ''> = [
	'top-left', 'top', 'top-right',
	'left-top', '', 'right-top',
	'left', '', 'right',
	'left-bottom', '', 'right-bottom',
	'bottom-left', 'bottom', 'bottom-right'
];

export const Positions: Story = {
	render: () => (
		<div style={{
			display: 'grid',
			gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
			gap: '64px',
			padding: '96px 64px',
			maxWidth: 960
		}}>
			{ALL_POSITIONS.map((position, index) => (
				position === ''
					? <div key={`gap-${index}`}/>
					: <HxButton key={position}
					            text={position}
					            tooltip={{content: `Tooltip in "${position}"`, position}}
					            style={{minHeight: '50px'}}/>
			))}
		</div>
	)
};

export const Basic: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '16px'}}>
			<HxButton text="Hover Top" tooltip="Hover me to see a tooltip."/>
			<HxButton text="Hover Right"
			          tooltip={{content: 'Tooltip can point to the right side.', position: 'right'}}/>
		</div>
	)
};
