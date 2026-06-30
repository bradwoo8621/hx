import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxInput, HxLabel, HxPanel} from '../src';

const meta: Meta<typeof HxPanel> = {
	title: 'Components/Layout/Panel',
	component: HxPanel,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		$model: {
			name: 'Data Model',
			control: 'object',
			table: {disable: true}
		},
		$field: {
			name: 'Field name of Data Model',
			control: 'text',
			table: {disable: true}
		},
		border: {
			name: 'Show Border',
			description: 'Whether to show panel border',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'true'}
			}
		},
		borderRadius: {
			name: 'Border Radius',
			description: 'Panel border radius size',
			control: {type: 'select'},
			options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'],
			table: {
				defaultValue: {summary: 'md'}
			}
		},
		collapsible: {
			name: 'Collapsible',
			description: 'Whether panel can be collapsed/expanded',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		defaultCollapsed: {
			name: 'Default Collapsed',
			description: 'Whether panel is collapsed by default when collapsible',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		title: {
			name: 'Panel Title',
			description: 'Title text displayed in panel header',
			control: 'text'
		},
		bodyColumns: {
			name: 'Body Columns',
			description: 'Number of grid columns for panel body',
			control: {type: 'number', min: 1, max: 24}
		},
		bodyGapX: {
			name: 'Body Horizontal Gap',
			description: 'Horizontal gap between body grid items',
			control: {type: 'select'},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl']
		},
		bodyGapY: {
			name: 'Body Vertical Gap',
			description: 'Vertical gap between body grid items',
			control: {type: 'select'},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl']
		},
		$visible: {
			name: 'Visible',
			control: 'boolean'
		}
	}
};

export default meta;
type Story = StoryObj<typeof HxPanel>;

/**
 * Basic panel with default configuration
 */
export const Basic: Story = {
	render: () => {
		return <HxPanel title="Basic Panel" style={{width: '600px'}}>
			<HxLabel text="Panel content goes here" gCols={12}/>
		</HxPanel>;
	}
};

/**
 * Panel without border
 */
export const NoBorder: Story = {
	render: () => {
		return <HxPanel title="No Border Panel" border={false} style={{width: '600px'}}>
			<HxLabel text="Panel content without border" gCols={12}/>
		</HxPanel>;
	}
};

/**
 * Panel with custom border radius
 */
export const CustomBorderRadius: Story = {
	render: () => {
		return <HxPanel title="Large Radius Panel" borderRadius="lg" style={{width: '600px'}}>
			<HxLabel text="Panel with large border radius" gCols={12}/>
		</HxPanel>;
	}
};

/**
 * Collapsible panel that can be expanded/collapsed
 */
export const Collapsible: Story = {
	render: () => {
		return <HxPanel title="Collapsible Panel" collapsible style={{width: '600px'}}>
			<HxLabel text="You can collapse/expand this panel by clicking the button in header" gCols={12}/>
		</HxPanel>;
	}
};

/**
 * Panel that is collapsed by default
 */
export const DefaultCollapsed: Story = {
	render: () => {
		return <HxPanel title="Default Collapsed Panel"
		                border={false}
		                borderRadius="none" collapsible defaultCollapsed style={{width: '600px'}}>
			<HxLabel text="This panel is collapsed by default" gCols={12}/>
		</HxPanel>;
	}
};

/**
 * Panel with custom header configuration
 */
export const CustomHeader: Story = {
	render: () => {
		return <HxPanel
			title="Custom Header Panel"
			headerJustifyContent="start"
			headerAlignItems="center"
			headerGapX="lg"
			headerPaddingT="sm"
			headerPaddingB="sm"
			style={{width: '600px'}}>
			<HxLabel text="Panel with custom header alignment and padding" gCols={12}/>
		</HxPanel>;
	}
};

/**
 * Panel with custom body grid configuration
 */
export const CustomBodyGrid: Story = {
	render: () => {
		const model = ERO.reactive({
			field1: 'field 1',
			field2: 'field 2',
			field3: 'field 3'
		});

		return <HxPanel
			title="Custom Grid Panel"
			$model={model}
			bodyGapX="lg"
			bodyGapY="md"
			bodyPaddingX="md"
			bodyPaddingT="md"
			bodyPaddingB="md"
			style={{width: '600px'}}>
			<HxLabel text="Field 1" gCols={6}/>
			{/* @ts-expect-error ignore the field type check */}
			<HxInput $field="field1" placeholder="Input 1" gCols={6}/>
			<HxLabel text="Field 2" gCols={6}/>
			{/* @ts-expect-error ignore the field type check */}
			<HxInput $field="field2" placeholder="Input 2" gCols={6}/>
			<HxLabel text="Field 3" gCols={6}/>
			{/* @ts-expect-error ignore the field type check */}
			<HxInput $field="field3" placeholder="Input 3" gCols={6}/>
		</HxPanel>;
	}
};

/**
 * Panel with scrollable content — collapse and re-expand to verify scroll resets to top
 */
export const RestoreScroll: Story = {
	render: () => {
		return <HxPanel title="Scroll Restore Test" collapsible style={{width: '600px'}}>
			<div style={{height: '200px', overflowY: 'auto', gridColumn: 'span 12'}}>
				{Array.from({length: 30}).map((_, i) => (
					<p key={i} style={{marginBlock: 8, fontSize: 14}}>
						Line {i + 1} — scroll down, collapse the panel, then re-expand. Scroll should be at top.
					</p>
				))}
			</div>
		</HxPanel>;
	}
};

/**
 * Panel with automatic model propagation to children
 */
export const ModelPropagation: Story = {
	render: () => {
		const model = ERO.reactive({
			user: {
				name: 'John Doe',
				email: 'john@example.com'
			}
		});

		return <HxPanel
			title="User Information"
			$model={model}
			$field="user"
			bodyGapX="md"
			bodyGapY="md"
			bodyPaddingT="sm"
			bodyPaddingB="sm"
			style={{width: '600px'}}>
			{/* $model is automatically propagated to child components */}
			<HxLabel text="Name" gCols={6}/>
			{/* @ts-expect-error ignore the field type check */}
			<HxInput $field="name" gCols={6}/>
			<HxLabel text="Email" gCols={6}/>
			{/* @ts-expect-error ignore the field type check */}
			<HxInput $field="email" data-hx-grid-cell-cols={6}/>
		</HxPanel>;
	}
};
