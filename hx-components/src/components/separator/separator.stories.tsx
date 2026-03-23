import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-ignore
import React from 'react';
import {HxSeparator, type HxSeparatorType} from './separator';

const meta: Meta<HxSeparatorType> = {
	title: 'Components/Layout/Separator',
	component: HxSeparator,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		direction: {
			name: 'Direction',
			description: 'Separator orientation: horizontal or vertical',
			control: {
				type: 'select'
			},
			options: ['dir-x', 'dir-y'],
			table: {
				defaultValue: {summary: 'dir-x'}
			}
		},
		color: {
			name: 'Color',
			description: 'Separator line color',
			control: {
				type: 'select'
			},
			options: ['primary', 'success', 'warn', 'danger', 'info', 'waive'],
			table: {
				defaultValue: {summary: 'default'}
			}
		},
		size: {
			name: 'Size',
			description: 'Separator line size',
			control: {
				type: 'select'
			},
			options: ['xs', 'sm', 'md', 'lg', 'xl'],
			table: {
				defaultValue: {summary: 'none'}
			}
		},
		marginX: {
			name: 'Horizontal Margin',
			description: 'Left and right margin size',
			control: {
				type: 'select'
			},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			table: {
				defaultValue: {summary: 'none'}
			}
		},
		marginY: {
			name: 'Vertical Margin',
			description: 'Top and bottom margin size',
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

type Story = StoryObj<typeof HxSeparator>;

export const Default: Story = {
	args: {
		marginY: 'md'
	},
	render: (args) => {
		return <div style={{width: '300px'}}>
			<p style={{margin: '0 0 8px 0'}}>Section 1 content</p>
			<HxSeparator {...args} />
			<p style={{margin: '8px 0 0 0'}}>Section 2 content</p>
		</div>;
	}
};

export const Vertical: Story = {
	args: {
		direction: 'dir-y',
		marginX: 'md',
		size: 'xs'
	},
	render: (args) => {
		return <div style={{display: 'flex', alignItems: 'center', height: '80px'}}>
			<div style={{flex: 1}}>Column 1</div>
			<HxSeparator {...args} />
			<div style={{flex: 1}}>Column 2</div>
		</div>;
	}
};

export const ColorVariants: Story = {
	render: (args) => {
		return <div style={{width: '300px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
			<div>
				<p style={{margin: '0 0 8px 0'}}>Default Color</p>
				<HxSeparator {...args} marginY="sm"/>
			</div>
			<div>
				<p style={{margin: '0 0 8px 0'}}>Primary</p>
				<HxSeparator {...args} marginY="sm" color="primary"/>
			</div>
			<div>
				<p style={{margin: '0 0 8px 0'}}>Success</p>
				<HxSeparator {...args} marginY="sm" color="success"/>
			</div>
			<div>
				<p style={{margin: '0 0 8px 0'}}>Warning</p>
				<HxSeparator {...args} marginY="sm" color="warn"/>
			</div>
			<div>
				<p style={{margin: '0 0 8px 0'}}>Danger</p>
				<HxSeparator {...args} marginY="sm" color="danger"/>
			</div>
			<div>
				<p style={{margin: '0 0 8px 0'}}>Info</p>
				<HxSeparator {...args} marginY="sm" color="info"/>
			</div>
			<div>
				<p style={{margin: '0 0 8px 0'}}>Waive</p>
				<HxSeparator {...args} marginY="sm" color="waive"/>
			</div>
		</div>;
	}
};

export const MarginVariants: Story = {
	render: (args) => {
		return <div style={{width: '300px'}}>
			<div style={{background: '#f5f5f5', padding: '8px'}}>
				<p style={{margin: 0}}>No Margin</p>
			</div>
			<HxSeparator {...args} marginY="none"/>
			<div style={{background: '#f5f5f5', padding: '8px'}}>
				<p style={{margin: 0}}>Extra Small Margin (xs)</p>
			</div>
			<HxSeparator {...args} marginY="xs"/>
			<div style={{background: '#f5f5f5', padding: '8px'}}>
				<p style={{margin: 0}}>Small Margin (sm)</p>
			</div>
			<HxSeparator {...args} marginY="sm"/>
			<div style={{background: '#f5f5f5', padding: '8px'}}>
				<p style={{margin: 0}}>Medium Margin (md)</p>
			</div>
			<HxSeparator {...args} marginY="md"/>
			<div style={{background: '#f5f5f5', padding: '8px'}}>
				<p style={{margin: 0}}>Large Margin (lg)</p>
			</div>
			<HxSeparator {...args} marginY="lg"/>
			<div style={{background: '#f5f5f5', padding: '8px'}}>
				<p style={{margin: 0}}>Extra Large Margin (xl)</p>
			</div>
			<HxSeparator {...args} marginY="xl"/>
			<div style={{background: '#f5f5f5', padding: '8px'}}>
				<p style={{margin: 0}}></p>
			</div>
		</div>;
	}
};

export const SectionDivider: Story = {
	render: (args) => {
		return <div style={{width: '400px'}}>
			<h2 style={{margin: '0 0 16px 0', fontSize: '20px'}}>Article Title</h2>
			<p style={{margin: '0 0 16px 0', lineHeight: 1.6, color: '#333'}}>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
				ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
			</p>
			<HxSeparator {...args} marginY="lg" color="primary"/>
			<h3 style={{margin: '0 0 12px 0', fontSize: '16px'}}>Subsection</h3>
			<p style={{margin: 0, lineHeight: 1.6, color: '#333'}}>
				Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
				nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.
			</p>
		</div>;
	}
};

export const InlineSeparator: Story = {
	render: (args) => {
		return <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
			<a href="#" style={{color: '#1890ff', textDecoration: 'none'}}>Home</a>
			<HxSeparator {...args} direction="dir-y" marginX="none" style={{height: '16px'}}/>
			<a href="#" style={{color: '#1890ff', textDecoration: 'none'}}>Products</a>
			<HxSeparator {...args} direction="dir-y" marginX="none" style={{height: '16px'}}/>
			<a href="#" style={{color: '#666', textDecoration: 'none'}}>Current Page</a>
		</div>;
	}
};
