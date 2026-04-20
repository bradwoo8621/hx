import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {MouseEvent} from 'react';
import {type HxContext, HxOverlayProvider, useHxOverlay} from '../../contexts';
import type {HxObject} from '../../types';
import {HxButton} from '../button';
import {HxFlex} from '../flex';
import {HxInput} from '../input';
import {HxLabel} from '../label';
import {HxPanel} from '../panel';
import {HxDialogDefaults} from './defaults';
import {HxDialog} from './dialog';

const meta: Meta<typeof HxDialog> = {
	title: 'Components/Overlay/Dialog',
	component: HxDialog,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		id: {
			name: 'Dialog ID',
			description: 'Unique identifier for the dialog instance',
			control: 'text'
		},
		zIndex: {
			name: 'Z-Index',
			description: 'Stack order of the dialog',
			control: 'number',
			table: {
				defaultValue: {summary: HxDialogDefaults.zIndex.toString()}
			}
		}
	}
};

export default meta;

type Story = StoryObj<typeof HxDialog>;

const DialogDemo = () => {
	const overlay = useHxOverlay();
	const model = ERO.reactive({
		username: '',
		password: ''
	});

	const openBasicDialog = () => {
		overlay.show('basic-dialog', model, () => {
			// Dialog opened callback
		});
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const closeBasicDialog = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		context.overlayInstance?.hide();
	};

	const openFormDialog = () => {
		overlay.show('form-dialog', model);
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const closeFormDialog = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		console.log('Login form submitted:', model);
		context.overlayInstance?.hide();
	};

	const openCustomDialog = () => {
		overlay.show('custom-dialog', model);
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const closeCustomDialog = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		context.overlayInstance?.hide();
	};

	return (
		<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
			<HxButton $model={model} color="primary" text="Open Basic Dialog" onClick={openBasicDialog}/>
			<HxButton $model={model} color="success" text="Open Form Dialog" onClick={openFormDialog}/>
			<HxButton $model={model} color="warn" text="Open Custom Dialog" onClick={openCustomDialog}/>

			{/* Basic Dialog Template */}
			<HxDialog id="basic-dialog">
				<HxPanel title="Basic Dialog" bodyGapY="lg" bodyPaddingB="lg" style={{width: '400px'}}>
					<HxLabel text="This is a basic dialog example. You can put any content inside the dialog."
					         gCols={12}/>
					<HxFlex justifyContent="end" gCols={12}>
						<HxButton $model={model} color="primary" text="Ok"
						          onClick={closeBasicDialog}/>
					</HxFlex>
				</HxPanel>
			</HxDialog>

			{/* Form Dialog Template */}
			<HxDialog id="form-dialog">
				<HxPanel title="Login Form" style={{width: '400px'}}>
					<HxLabel text="Username" gCols={12} style={{marginBlockStart: 12}}/>
					<HxInput $model={model} $field="username" placeholder="Enter your username"
					         gCols={12}/>
					<HxLabel text="Password" gCols={12} style={{marginBlockStart: 16}}/>
					<HxInput $model={model} $field="password" type="password"
					         placeholder="Enter your password"
					         gCols={12}/>
					<HxFlex justifyContent="end" gCols={12} style={{marginBlockStart: 16, marginBlockEnd: 12}}>
						<HxButton $model={model} color="primary" text="Login" onClick={closeFormDialog}/>
					</HxFlex>
				</HxPanel>
			</HxDialog>

			{/* Custom Content Dialog Template */}
			<HxDialog id="custom-dialog" zIndex={1000}>
				<div style={{width: '600px', padding: '24px'}}>
					<h3 style={{margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600}}>Custom Dialog Content</h3>
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
						<HxButton $model={model} color="primary" text="Save Changes" onClick={closeCustomDialog}/>
					</div>
				</div>
			</HxDialog>
		</div>
	);
};

export const Basic: Story = {
	render: () => (
		<HxOverlayProvider>
			<DialogDemo/>
		</HxOverlayProvider>
	),
	args: {
		id: 'basic-dialog',
		zIndex: 1000,
		children: <div>Dialog content</div>
	}
};

const LongContentDemo = () => {
	const overlay = useHxOverlay();
	const model = ERO.reactive({});

	const openLongDialog = () => {
		overlay.show('long-dialog', model);
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const closeLongDialog = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		context.overlayInstance?.hide();
	};

	return (
		<div>
			<HxButton $model={model} color="primary" text="Open Long Content Dialog" onClick={openLongDialog}/>

			<HxDialog id="long-dialog" zIndex={1000}>
				<HxPanel title="Long Content Dialog" bodyPaddingX="none" style={{width: '500px', maxHeight: '70vh'}}>
					<HxFlex style={{overflowY: 'auto', maxHeight: '50vh', paddingInline: 16}} gCols={12}>
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
						<HxButton $model={model} various="outline" text="Close" onClick={closeLongDialog}/>
					</HxFlex>
				</HxPanel>
			</HxDialog>
		</div>
	);
};

export const LongContent: Story = {
	render: () => (
		<HxOverlayProvider>
			<LongContentDemo/>
		</HxOverlayProvider>
	),
	args: {
		id: 'long-dialog',
		zIndex: 1000
	}
};
