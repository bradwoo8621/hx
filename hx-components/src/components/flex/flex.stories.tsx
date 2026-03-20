import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-ignore
import React from 'react';
import {HxInput} from '../input';
import {HxFlex, type HxFlexGapX, type HxFlexGapY} from './flex';

const meta = {
	title: 'Components/Layout/Flex',
	component: HxFlex,
	tags: ['autodocs'],
	argTypes: {
		$model: {
			name: 'Data Model',
			control: 'text',
			table: {disable: true}
		},
		$field: {
			name: 'Field name of Data Model',
			control: 'text',
			table: {disable: true}
		},
		direction: {
			control: 'select',
			options: ['dir-x', 'dir-y'],
			description: 'Flex container direction',
			defaultValue: 'dir-x'
		},
		border: {
			control: 'boolean',
			description: 'Whether to show border around flex container',
			defaultValue: false
		},
		gapX: {
			control: 'select',
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			description: 'Horizontal gap between flex items',
			defaultValue: 'md'
		},
		gapY: {
			control: 'select',
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			description: 'Vertical gap between flex items',
			defaultValue: 'md'
		},
		$visible: {
			name: 'Visible',
			control: 'boolean'
		}
	}
} satisfies Meta<typeof HxFlex>;

export default meta;
type Story = StoryObj<typeof HxFlex>;

/**
 * Default horizontal flex layout with medium gap
 */
export const Default: Story = {
	args: {
		$model: ERO.reactive({}),
		direction: 'dir-x',
		gapX: 'md'
	},
	render: (args) => (
		<HxFlex {...args}>
			<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 1</div>
			<div style={{padding: '8px 16px', background: '#e0e0e0'}}>Item 2</div>
			<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 3</div>
		</HxFlex>
	)
};

/**
 * Vertical flex layout with medium gap
 */
export const Vertical: Story = {
	args: {
		$model: ERO.reactive({}),
		direction: 'dir-y',
		gapY: 'md'
	},
	render: (args) => (
		<HxFlex {...args}>
			<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 1</div>
			<div style={{padding: '8px 16px', background: '#e0e0e0'}}>Item 2</div>
			<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 3</div>
		</HxFlex>
	)
};

/**
 * Flex layout with border enabled
 */
export const WithBorder: Story = {
	args: {
		$model: ERO.reactive({}),
		direction: 'dir-x',
		gapX: 'md',
		border: true
	},
	render: (args) => (
		<HxFlex {...args}>
			<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 1</div>
			<div style={{padding: '8px 16px', background: '#e0e0e0'}}>Item 2</div>
			<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 3</div>
		</HxFlex>
	)
};

/**
 * Different gap size variations
 */
export const GapSizes: Story = {
	render: () => {
		const $model = ERO.reactive({});
		return <HxFlex $model={$model} direction="dir-y" gapY="lg">
			<div>
				<h4 style={{margin: '0 0 8px 0'}}>Gap None (no gap)</h4>
				<HxFlex $model={$model} direction="dir-x" gapX="none" border>
					<div style={{padding: '4px 8px', background: '#f0f0f0'}}>Item 1</div>
					<div style={{padding: '4px 8px', background: '#e0e0e0'}}>Item 2</div>
				</HxFlex>
			</div>

			<div>
				<h4 style={{margin: '0 0 8px 0'}}>Gap SM (small)</h4>
				<HxFlex $model={$model} direction="dir-x" gapX="sm" border>
					<div style={{padding: '4px 8px', background: '#f0f0f0'}}>Item 1</div>
					<div style={{padding: '4px 8px', background: '#e0e0e0'}}>Item 2</div>
				</HxFlex>
			</div>

			<div>
				<h4 style={{margin: '0 0 8px 0'}}>Gap MD (medium - default)</h4>
				<HxFlex $model={$model} direction="dir-x" gapX="md" border>
					<div style={{padding: '4px 8px', background: '#f0f0f0'}}>Item 1</div>
					<div style={{padding: '4px 8px', background: '#e0e0e0'}}>Item 2</div>
				</HxFlex>
			</div>

			<div>
				<h4 style={{margin: '0 0 8px 0'}}>Gap LG (large)</h4>
				<HxFlex $model={$model} direction="dir-x" gapX="lg" border>
					<div style={{padding: '4px 8px', background: '#f0f0f0'}}>Item 1</div>
					<div style={{padding: '4px 8px', background: '#e0e0e0'}}>Item 2</div>
				</HxFlex>
			</div>
		</HxFlex>;
	},
	args: {}
};

/**
 * Flex layout with form elements
 */
export const FormLayout: Story = {
	render: () => {
		const $model = ERO.reactive({
			firstName: 'John',
			lastName: 'Doe',
			email: 'john.doe@gmail.com'
		});

		return (
			<HxFlex $model={$model} direction="dir-y" border={true} gapY="md"
			        paddingX="lg" paddingT="md" paddingB="md"
			        style={{width: '500px'}}>
				{/* @ts-expect-error $model passed by parent */}
				<HxFlex direction="dir-x" gapX="md">
					{/* @ts-expect-error $model passed by parent */}
					<HxFlex direction="dir-y" gapY="none" style={{flex: 1}}>
						<label>First Name</label>
						{/* @ts-expect-error $model passed by parent */}
						<HxInput $field="firstName"/>
					</HxFlex>
					{/* @ts-expect-error $model passed by parent */}
					<HxFlex direction="dir-y" gapY="none" style={{flex: 1}}>
						<label>Last Name</label>
						{/* @ts-expect-error $model passed by parent */}
						<HxInput $field="lastName"/>
					</HxFlex>
				</HxFlex>
				{/* @ts-expect-error $model passed by parent */}
				<HxFlex direction="dir-y" gapY="none">
					<label>Email</label>
					{/* @ts-expect-error $model passed by parent */}
					<HxInput $field="email" type="text"/>
				</HxFlex>
			</HxFlex>
		);
	}
};

/**
 * Nested flex layout example
 */
export const Nested: Story = {
	render: () => {
		const $model = ERO.reactive({});
		return <HxFlex $model={$model} direction="dir-y" gapY="lg" border
		               justifyContent="space-between"
		               style={{padding: '16px'}}>
			<div style={{fontSize: '18px', fontWeight: 'bold'}}>Page Header</div>

			<HxFlex $model={$model} direction="dir-x" gapX="lg">
				<HxFlex $model={$model} direction="dir-y" gapY="md" style={{flex: 2}}>
					<div style={{padding: '16px', background: '#f5f5f5'}}>Main Content Area</div>
					<div style={{padding: '16px', background: '#f5f5f5'}}>Additional Content</div>
				</HxFlex>

				<HxFlex $model={$model} direction="dir-y" gapY="md" style={{flex: 1}}>
					<div style={{padding: '16px', background: '#eaeaea'}}>Sidebar Widget 1</div>
					<div style={{padding: '16px', background: '#eaeaea'}}>Sidebar Widget 2</div>
					<div style={{padding: '16px', background: '#eaeaea'}}>Sidebar Widget 3</div>
				</HxFlex>
			</HxFlex>

			<div style={{padding: '8px', background: '#f0f0f0', textAlign: 'center'}}>Page Footer</div>
		</HxFlex>;
	}
};

/**
 * Test gapX and gapY behavior in both horizontal and vertical layouts
 * Verifies that gapX controls horizontal spacing and gapY controls vertical spacing
 * regardless of flex container direction
 */
export const GapDirectionTest: Story = {
	render: () => {
		const $model = ERO.reactive({});
		return <HxFlex $model={$model} direction="dir-y" gapY="lg" style={{maxWidth: '800px'}}>
			{/* Horizontal layout test */}
			<div>
				<h3 style={{margin: '0 0 16px 0'}}>Horizontal Layout (dir-x)</h3>
				<p style={{margin: '0 0 8px 0'}}>gapX="lg" (24px horizontal), gapY="md" (12px vertical)</p>
				<HxFlex $model={$model} direction="dir-x" gapX="lg" gapY="md" border
				        style={{flexWrap: 'wrap', width: '400px', padding: '8px'}}>
					{Array.from({length: 6}).map((_, i) => (
						<div key={i} style={{
							padding: '12px 24px',
							background: i % 2 === 0 ? '#f0f0f0' : '#e0e0e0',
							width: '100px'
						}}>
							Item {i + 1}
						</div>
					))}
				</HxFlex>
			</div>

			{/* Vertical layout test */}
			<div>
				<h3 style={{margin: '0 0 16px 0'}}>Vertical Layout (dir-y)</h3>
				<p style={{margin: '0 0 8px 0'}}>gapX="lg" (24px horizontal), gapY="md" (12px vertical)</p>
				<HxFlex $model={$model} direction="dir-y" gapX="lg" gapY="md" border
				        style={{flexWrap: 'wrap', height: '282px', padding: '8px'}}>
					{Array.from({length: 6}).map((_, i) => (
						<div key={i} style={{
							padding: '12px 24px',
							background: i % 2 === 0 ? '#f0f0f0' : '#e0e0e0',
							height: '60px'
						}}>
							Item {i + 1}
						</div>
					))}
				</HxFlex>
			</div>

			{/* Side by side comparison */}
			<div>
				<h3 style={{margin: '0 0 16px 0'}}>Gap Size Comparison (Horizontal)</h3>
				<HxFlex $model={$model} direction="dir-y" gapY="lg">
					{['none', 'xs', 'sm', 'md', 'lg', 'xl'].map((gapSize, index, gaps) => (
						<div key={gapSize}>
							<h4 style={{margin: '0 0 8px 0'}}>gapX={gapSize} gapY={gaps[gaps.length - 1 - index]}</h4>
							<HxFlex $model={$model} direction="dir-x"
							        gapX={gapSize as HxFlexGapX} gapY={gaps[gaps.length - 1 - index] as HxFlexGapY}
							        border>
								<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 1</div>
								<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 2</div>
								<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 3</div>
								<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 4</div>
								<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 5</div>
								<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 6</div>
								<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 7</div>
								<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 8</div>
								<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 9</div>
								<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 10</div>
							</HxFlex>
						</div>
					))}
				</HxFlex>
			</div>

			<div>
				<h3 style={{margin: '0 0 16px 0'}}>Gap Size Comparison (Vertical)</h3>
				<HxFlex $model={$model} direction="dir-y" gapY="lg">
					{['none', 'xs', 'sm', 'md', 'lg', 'xl'].map((gapSize, index, gaps) => (
						<div key={gapSize}>
							<h4 style={{margin: '0 0 8px 0'}}>gapX={gaps[gaps.length - 1 - index]} gapY={gapSize}</h4>
							<HxFlex $model={$model} direction="dir-y"
							        gapX={gaps[gaps.length - 1 - index] as HxFlexGapX} gapY={gapSize as HxFlexGapY}
							        border style={{height: '300px'}}>
								<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 1</div>
								<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 2</div>
								<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 3</div>
								<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 4</div>
								<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 5</div>
								<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 6</div>
								<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 7</div>
								<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 8</div>
								<div style={{padding: '8px 16px', background: '#f0f0f0'}}>Item 9</div>
								<div style={{padding: '8px 16px', background: '#d0d0d0'}}>Item 10</div>
							</HxFlex>
						</div>
					))}
				</HxFlex>
			</div>
		</HxFlex>;
	}
};
