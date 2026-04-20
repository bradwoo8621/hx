import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxOverlayProvider, useHxOverlay} from '../../contexts/overlay/overlay';
import {HxButton} from '../button';
import {HxInput} from '../input';
import {HxPanel} from '../panel';
import {HxDialog} from './dialog';
import {HxDialogDefaults} from './defaults';

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
		},
		$model: {
			name: 'Data Model',
			control: 'text',
			table: {disable: true}
		},
		$overlayHandle: {
			name: 'Overlay Handle',
			control: 'text',
			table: {disable: true}
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

	const openFormDialog = () => {
		overlay.show('form-dialog', model, () => {
			// You can use handle to close the dialog programmatically
			setTimeout(() => {
				// handle.close();
			}, 3000);
		});
	};

	const openCustomDialog = () => {
		overlay.show('custom-dialog', model);
	};

	return (
		<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
			<HxButton $model={model} color="primary" text="Open Basic Dialog" onClick={openBasicDialog}/>
			<HxButton $model={model} color="success" text="Open Form Dialog" onClick={openFormDialog}/>
			<HxButton $model={model} color="warn" text="Open Custom Dialog" onClick={openCustomDialog}/>

			{/* Basic Dialog Template */}
			<HxDialog id="basic-dialog" zIndex={1000}>
				<HxPanel title="Basic Dialog" style={{width: '400px'}}>
					<p style={{margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.5'}}>
						This is a basic dialog example. You can put any content inside the dialog.
					</p>
					<div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
						<HxButton $model={model} various="outline" text="Cancel" onClick={(e, handle) => handle?.close()}/>
						<HxButton $model={model} color="primary" text="Confirm" onClick={(e, handle) => handle?.close()}/>
					</div>
				</HxPanel>
			</HxDialog>

			{/* Form Dialog Template */}
			<HxDialog id="form-dialog" zIndex={1000}>
				<HxPanel title="Login Form" style={{width: '400px'}}>
					<div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
						<HxInput $model={model} $field="username" label="Username" placeholder="Enter your username"/>
						<HxInput $model={model} $field="password" label="Password" type="password" placeholder="Enter your password"/>
						<div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px'}}>
							<HxButton $model={model} various="outline" text="Cancel" onClick={(e, handle) => handle?.close()}/>
							<HxButton $model={model} color="primary" text="Login" onClick={(e, handle) => {
								console.log('Login form submitted:', model);
								handle?.close();
							}}/>
						</div>
					</div>
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
							<p style={{margin: 0, fontSize: '13px', color: '#6b7280'}}>Custom content in right column</p>
						</div>
					</div>
					<div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
						<HxButton $model={model} various="outline" text="Close" onClick={(e, handle) => handle?.close()}/>
						<HxButton $model={model} color="primary" text="Save Changes" onClick={(e, handle) => handle?.close()}/>
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

	return (
		<div>
			<HxButton $model={model} color="primary" text="Open Long Content Dialog" onClick={openLongDialog}/>

			<HxDialog id="long-dialog" zIndex={1000}>
				<HxPanel title="Long Content Dialog" style={{width: '500px', maxHeight: '70vh'}}>
					<div style={{overflowY: 'auto', maxHeight: '50vh', paddingRight: '8px'}}>
						{Array.from({length: 20}).map((_, i) => (
							<p key={i} style={{margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.6'}}>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
								Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
							</p>
						))}
					</div>
					<div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px'}}>
						<HxButton $model={model} various="outline" text="Close" onClick={(e, handle) => handle?.close()}/>
					</div>
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
