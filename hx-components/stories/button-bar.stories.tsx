import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxButton, HxButtonBar, HxPanel} from '../src';

const meta: Meta<typeof HxButtonBar> = {
	title: 'Components/Layout/ButtonBar',
	component: HxButtonBar,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		leading: {
			name: 'Leading Buttons',
			description: 'Button group to render on the left side'
		},
		tailing: {
			name: 'Tailing Buttons',
			description: 'Button group to render on the right side'
		},
		gapX: {
			name: 'Horizontal Gap',
			description: 'Horizontal spacing between buttons in each group',
			control: 'text'
		},
		paddingX: {
			name: 'Horizontal Padding',
			description: 'Horizontal padding for the entire button bar',
			control: 'text'
		}
	}
};

export default meta;

type Story = StoryObj<typeof HxButtonBar>;

const ButtonBarDemo = () => {
	const model = ERO.reactive({});
	const handleClick = (action: string) => () => console.log(`${action} clicked`);

	return (
		<div style={{width: '600px', display: 'flex', flexDirection: 'column', gap: '32px'}}>
			{/* Basic usage with both leading and tailing buttons */}
			<HxPanel title="Basic Dual Button Bar" bodyPaddingT="lg">
				<HxButtonBar gCols={12} paddingX="none" paddingT="none"
				             leading={<HxButton $model={model} variant="outline" color="info" text="Save Draft"
				                                onClick={handleClick('Save Draft')}/>}
				             tailing={<>
					             <HxButton $model={model} variant="ghost" color="waive" text="Cancel"
					                       onClick={handleClick('Cancel')}/>
					             <HxButton $model={model} variant="solid" color="primary" text="Submit"
					                       onClick={handleClick('Submit')}/>
				             </>}/>
			</HxPanel>

			{/* Only leading buttons */}
			<HxPanel title="Left Aligned Button Bar" bodyPaddingT="lg">
				<HxButtonBar gCols={12} paddingX="none" paddingT="none"
				             leading={<>
					             <HxButton $model={model} variant="solid" color="primary" text="Previous"
					                       onClick={handleClick('Previous')}/>
					             <HxButton $model={model} variant="outline" color="primary" text="Next"
					                       onClick={handleClick('Next')}/>
				             </>}/>
			</HxPanel>

			{/* Only tailing buttons */}
			<HxPanel title="Right Aligned Button Bar" bodyPaddingT="lg">
				<HxButtonBar gCols={12} paddingX="none" paddingT="none"
				             tailing={<>
					             <HxButton $model={model} variant="ghost" color="waive" text="Reset"
					                       onClick={handleClick('Reset')}/>
					             <HxButton $model={model} variant="solid" color="danger" text="Delete"
					                       onClick={handleClick('Delete')}/>
				             </>}/>
			</HxPanel>
		</div>
	);
};

export const Basic: Story = {
	render: () => <ButtonBarDemo/>,
	args: {
		leading: <HxButton $model={ERO.reactive({})} text="Left Button"/>,
		tailing: <HxButton $model={ERO.reactive({})} text="Right Button"/>
	}
};

const CustomizationDemo = () => {
	const model = ERO.reactive({});
	const handleClick = (action: string) => () => console.log(`${action} clicked`);

	return (
		<div style={{width: '600px', display: 'flex', flexDirection: 'column', gap: '32px'}}>
			{/* Custom gap size */}
			<HxPanel title="Custom Button Spacing" bodyPaddingT="lg">
				<HxButtonBar gCols={12} gapX="lg" paddingX="none" paddingT="none"
				             leading={<>
					             <HxButton $model={model} variant="outline" text="Button 1"
					                       onClick={handleClick('Button 1')}/>
					             <HxButton $model={model} variant="outline" text="Button 2"
					                       onClick={handleClick('Button 2')}/>
					             <HxButton $model={model} variant="outline" text="Button 3"
					                       onClick={handleClick('Button 3')}/>
				             </>}/>
			</HxPanel>

			{/* Custom padding */}
			<HxPanel title="Custom Container Padding" bodyPaddingT="lg" style={{background: '#f5f5f5'}}>
				<HxButtonBar gCols={12}
				             paddingX="xl" paddingT="lg" paddingB="lg"
				             leading={<HxButton $model={model} variant="ghost" text="Back"
				                                onClick={handleClick('Back')}/>}
				             tailing={<>
					             <HxButton $model={model} variant="outline" text="Export"
					                       onClick={handleClick('Export')}/>
					             <HxButton $model={model} variant="solid" text="Import"
					                       onClick={handleClick('Import')}/>
				             </>}/>
			</HxPanel>

			{/* Complex multi-button example */}
			<HxPanel title="Form Action Bar" bodyPaddingT="lg">
				<HxButtonBar gCols={12} paddingX="none" paddingT="none"
				             leading={<>
					             <HxButton $model={model} variant="ghost" color="info" text="Help"
					                       onClick={handleClick('Help')}/>
					             <HxButton $model={model} variant="ghost" color="warn" text="Preview"
					                       onClick={handleClick('Preview')}/>
				             </>}
				             tailing={<>
					             <HxButton $model={model} variant="ghost" color="waive" text="Cancel"
					                       onClick={handleClick('Cancel')}/>
					             <HxButton $model={model} variant="outline" color="success" text="Save"
					                       onClick={handleClick('Save')}/>
					             <HxButton $model={model} variant="solid" color="primary" text="Publish"
					                       onClick={handleClick('Publish')}/>
				             </>}/>
			</HxPanel>
		</div>
	);
};

export const Customization: Story = {
	render: () => <CustomizationDemo/>,
	args: {
		leading: <HxButton $model={ERO.reactive({})} text="Left Button"/>,
		tailing: <HxButton $model={ERO.reactive({})} text="Right Button"/>,
		gapX: 'lg',
		paddingX: 'xl'
	}
};
