import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {MouseEvent} from 'react';
import {type HxContext, useHxOverlay} from '../../contexts';
import type {HxObject} from '../../types';
import {HxButton} from '../button';
import {HxFlex} from '../flex';
import {HxInput} from '../input';
import {HxLabel} from '../label';
import {HxPanel} from '../panel';
import {HxOverlayDefaults} from './defaults';
import {HxOverlay} from './overlay';

const meta: Meta<typeof HxOverlay> = {
	title: 'Components/Overlay/Overlay',
	component: HxOverlay,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		id: {
			name: 'Overlay ID',
			description: 'Unique identifier for the overlay instance',
			control: 'text'
		},
		zIndex: {
			name: 'Z-Index',
			description: 'Stack order of the overlay',
			control: 'number',
			table: {
				defaultValue: {summary: HxOverlayDefaults.zIndex.toString()}
			}
		}
	}
};

export default meta;

type Story = StoryObj<typeof HxOverlay>;

const OverlayDemo = () => {
	const overlay = useHxOverlay();
	const model = ERO.reactive({
		username: '',
		password: ''
	});

	const openBasicOverlay = () => {
		overlay.show('basic-overlay', model, () => {
			// Overlay opened callback
		});
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const closeBasicOverlay = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		context.overlayInstance?.hide();
	};

	const openFormOverlay = () => {
		overlay.show('form-overlay', model);
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const closeFormOverlay = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		console.log('Login form submitted:', model);
		context.overlayInstance?.hide();
	};

	const openCustomOverlay = () => {
		overlay.show('custom-overlay', model);
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const closeCustomOverlay = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		context.overlayInstance?.hide();
	};

	const openLeftDrawer = () => {
		overlay.show('left-drawer', model);
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const closeLeftDrawer = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		context.overlayInstance?.hide();
	};

	const openRightDrawer = () => {
		overlay.show('right-drawer', model);
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const closeRightDrawer = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		context.overlayInstance?.hide();
	};

	return (
		<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
			<HxButton $model={model} color="primary" text="Open Basic Dialog" onClick={openBasicOverlay}/>
			<HxButton $model={model} color="success" text="Open Form Top Drawer" onClick={openFormOverlay}/>
			<HxButton $model={model} color="warn" text="Open Custom Bottom Drawer" onClick={openCustomOverlay}/>
			<HxButton $model={model} color="danger" text="Open Left Drawer" onClick={openLeftDrawer}/>
			<HxButton $model={model} color="info" text="Open Right Drawer" onClick={openRightDrawer}/>

			{/* Basic Overlay Template */}
			<HxOverlay id="basic-overlay" hideOnClickBackdrop={true} hideOnEscape={true} width="xs">
				<HxPanel title="Basic Dialog" bodyGapY="lg" bodyPaddingB="lg">
					<HxLabel text="This is a basic overlay example. You can put any content inside the overlay."
					         gCols={12}/>
					<HxFlex justifyContent="end" gCols={12}>
						<HxButton $model={model} color="primary" text="Ok"
						          onClick={closeBasicOverlay}/>
					</HxFlex>
				</HxPanel>
			</HxOverlay>

			{/* Form Overlay Template */}
			<HxOverlay id="form-overlay" width="sm" role="drawer-top">
				<HxPanel title="Login Form" border={false} borderRadius="none" headerPaddingX="md" bodyPaddingX="md">
					<HxLabel text="Username" gCols={12} style={{marginBlockStart: 12}}/>
					<HxInput $model={model} $field="username" placeholder="Enter your username"
					         gCols={12}/>
					<HxLabel text="Password" gCols={12} style={{marginBlockStart: 16}}/>
					<HxInput $model={model} $field="password" type="password"
					         placeholder="Enter your password"
					         gCols={12}/>
					<HxFlex justifyContent="end" gCols={12} style={{marginBlockStart: 16, marginBlockEnd: 12}}>
						<HxButton $model={model} color="primary" text="Login" onClick={closeFormOverlay}/>
					</HxFlex>
				</HxPanel>
			</HxOverlay>

			{/* Custom Content Overlay Template */}
			<HxOverlay id="custom-overlay" width="md" maxHeight="sm" role="drawer-bottom">
				<div style={{padding: '24px'}}>
					<h3 style={{margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600}}>Custom Overlay Content</h3>
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px'}}>
						<div style={{padding: '16px', border: '1px solid #e5e7eb', borderRadius: '6px'}}>
							<h4 style={{margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600}}>Section 1</h4>
							<p style={{margin: 0, fontSize: '13px', color: '#6b7280'}}>Custom content in left column</p>
						</div>
						<div style={{padding: '16px', border: '1px solid #e5e7eb', borderRadius: '6px'}}>
							<h4 style={{margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600}}>Section 2</h4>
							<p style={{margin: 0, fontSize: '13px', color: '#6b7280'}}>Custom content in right
								column</p>
						</div>
					</div>
					<div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
						<HxButton $model={model} color="primary" text="Save Changes" onClick={closeCustomOverlay}/>
					</div>
				</div>
			</HxOverlay>

			<HxOverlay id="left-drawer" role="drawer-left" hideOnClickBackdrop={true} width="xs">
				<HxPanel title="Left Drawer" bodyGapY="lg" bodyPaddingB="lg">
					<HxLabel text="This is a left drawer example. You can put any content inside the overlay."
					         gCols={12}/>
					<HxFlex justifyContent="end" gCols={12}>
						<HxButton $model={model} color="primary" text="Ok"
						          onClick={closeLeftDrawer}/>
					</HxFlex>
				</HxPanel>
			</HxOverlay>

			<HxOverlay id="right-drawer" role="drawer-right" hideOnClickBackdrop={true} width="xs">
				<HxPanel title="Right Drawer" bodyGapY="lg" bodyPaddingB="lg">
					<HxLabel text="This is a right drawer example. You can put any content inside the overlay."
					         gCols={12}/>
					<HxFlex justifyContent="end" gCols={12}>
						<HxButton $model={model} color="primary" text="Ok"
						          onClick={closeRightDrawer}/>
					</HxFlex>
				</HxPanel>
			</HxOverlay>
		</div>
	);
};

export const Basic: Story = {
	render: () => <OverlayDemo/>
};

const LongContentDemo = () => {
	const overlay = useHxOverlay();
	const model = ERO.reactive({});

	const openLongOverlay = () => {
		overlay.show('long-overlay', model);
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const closeLongOverlay = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		context.overlayInstance?.hide();
	};

	return (
		<div>
			<HxButton $model={model} color="primary" text="Open Long Content Dialog" onClick={openLongOverlay}/>

			<HxOverlay id="long-overlay" width="md">
				<HxPanel title="Long Content Dialog" bodyPaddingX="none" style={{gridTemplateRows: '1fr auto'}}>
					<HxFlex style={{overflowY: 'auto', paddingInline: 16, maxHeight: '40vh'}} gCols={12}>
						{Array.from({length: 20}).map((_, i) => (
							<p key={i} style={{marginBlock: 12, fontSize: 14, lineHeight: '1.6'}}>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
								incididunt ut labore et dolore magna aliqua.
								Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
								commodo consequat.
							</p>
						))}
					</HxFlex>
					<HxFlex justifyContent="end" style={{marginBlock: '12px', paddingInline: 16}} gCols={12}>
						<HxButton $model={model} various="outline" text="Close" onClick={closeLongOverlay}/>
					</HxFlex>
				</HxPanel>
			</HxOverlay>
		</div>
	);
};

export const LongContent: Story = {
	render: () => <LongContentDemo/>
};

const NestedOverlaysDemo = () => {
	const overlay = useHxOverlay();
	const model = ERO.reactive({
		inputValue: ''
	});

	const openFirstOverlay = () => {
		overlay.show('first-overlay', model);
	};

	const openSecondOverlay = () => {
		overlay.show('second-overlay', model);
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const closeOverlay = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		context.overlayInstance?.hide();
	};

	const format = (value: string) => {
		return 'Content from first overlay: ' + value;
	};

	return (
		<div>
			<HxButton $model={model} color="primary" text="Open Nested Overlays" onClick={openFirstOverlay}/>

			{/* First level overlay */}
			<HxOverlay id="first-overlay" width="md" hideOnClickBackdrop={true}>
				<HxPanel title="First Level Dialog" bodyGapY="lg" bodyPaddingB="lg">
					<HxLabel
						text="This is the first level overlay. Click the button below to open a second overlay on top."
						gCols={12}/>
					<HxInput $model={model} $field="inputValue" placeholder="Enter some content" gCols={12}/>
					<HxFlex justifyContent="end" gapX="sm" gCols={12}>
						<HxButton $model={model} various="outline" text="Cancel" onClick={closeOverlay}/>
						<HxButton $model={model} color="primary" text="Open Second Dialog" onClick={openSecondOverlay}/>
					</HxFlex>
				</HxPanel>
			</HxOverlay>

			{/* Second level nested overlay */}
			<HxOverlay id="second-overlay" width="sm" hideOnClickBackdrop={true}>
				<HxPanel title="Second Level Dialog" bodyGapY="lg" bodyPaddingB="lg">
					<HxLabel
						text="This is a nested overlay that appears on top of the first one. The z-index is automatically managed so it always appears above the parent."
						gCols={12}/>
					<HxLabel $model={model} $field="inputValue" format={format} gCols={12} color="success"/>
					<HxFlex justifyContent="end" gCols={12}>
						<HxButton $model={model} color="primary" text="Close" onClick={closeOverlay}/>
					</HxFlex>
				</HxPanel>
			</HxOverlay>
		</div>
	);
};

export const NestedOverlays: Story = {
	render: () => <NestedOverlaysDemo/>
};
