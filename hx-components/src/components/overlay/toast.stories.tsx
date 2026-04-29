import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {type MouseEvent} from 'react';
import {type HxContext, HxOverlayProvider, useHxOverlay} from '../../contexts';
import type {HxObject} from '../../types';
import {HxButton} from '../button';
import {HxFlex} from '../flex';
import {MagnifyingGlass} from '../icons';
import {HxErrorToast, HxInfoToast, HxSuccessToast, HxToast, HxWarnToast} from './toast';

const meta: Meta<typeof HxToast> = {
	title: 'Components/Overlay/Toast',
	component: HxToast,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		type: {
			name: 'Toast Type',
			description: 'Type of toast, determines icon and color scheme',
			control: {type: 'select'},
			options: ['info', 'success', 'warn', 'error', 'question']
		},
		message: {
			name: 'Message',
			description: 'Content to display in the toast',
			control: 'text'
		},
		dismissDelay: {
			name: 'Auto Dismiss Delay',
			description: 'Auto close delay in milliseconds, true for default delay, false to disable auto close',
			control: {type: 'number'}
		},
		zIndex: {
			name: 'Z-Index',
			description: 'Stack order of the toast',
			control: 'number'
		}
	}
};

export default meta;

type Story = StoryObj<typeof HxToast>;

const BasicToastDemo = () => {
	const overlay = useHxOverlay();
	const model = ERO.reactive({});

	const openInfoToast = () => overlay.show('info-toast', model);
	const openSuccessToast = () => overlay.show('success-toast', model);
	const openWarnToast = () => overlay.show('warn-toast', model);
	const openErrorToast = () => overlay.show('error-toast', model);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
	const handleDismiss = (_ev: MouseEvent<HTMLElement> | undefined, $model: HxObject<any>, _context: HxContext) => {
		console.log('Toast dismissed', $model);
	};

	return (
		<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
			<HxButton $model={model} color="info" text="Info Toast" onClick={openInfoToast}/>
			<HxButton $model={model} color="success" text="Success Toast" onClick={openSuccessToast}/>
			<HxButton $model={model} color="warn" text="Warning Toast" onClick={openWarnToast}/>
			<HxButton $model={model} color="danger" text="Error Toast" onClick={openErrorToast}/>

			{/* Info toast: auto closes after default delay */}
			<HxInfoToast id="info-toast"
			             role="toast-tl"
			             message="This is an informational toast notification"
			             onDismissed={handleDismiss}/>

			{/* Success toast: auto closes after default delay */}
			<HxSuccessToast id="success-toast"
			                role="toast-tr"
			                message="Operation completed successfully!"
			                onDismissed={handleDismiss}/>

			{/* Warning toast: auto closes after default delay */}
			<HxWarnToast id="warn-toast"
			             role="toast-br"
			             message="Warning: This action may have unintended consequences"
			             onDismissed={handleDismiss}/>

			{/* Error toast: does NOT auto close by default, requires manual dismissal */}
			<HxErrorToast id="error-toast"
			              role="toast-bl"
			              message="Error: Failed to process your request. Please try again later."
			              onDismissed={handleDismiss}/>
		</div>
	);
};

export const Basic: Story = {
	render: () => (
		<HxOverlayProvider>
			<BasicToastDemo/>
		</HxOverlayProvider>
	),
	args: {
		id: 'demo-toast',
		type: 'info',
		message: 'This is a sample toast notification'
	}
};

const CustomToastDemo = () => {
	const overlay = useHxOverlay();
	const model = ERO.reactive({});

	const openCustomDelayToast = () => overlay.show('custom-delay-toast', model);
	const openPersistentToast = () => overlay.show('persistent-toast', model);
	const openCustomButtonToast = () => overlay.show('custom-btn-toast', model);
	const openCustomIconToast = () => overlay.show('custom-icon-toast', model);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
	const handleAction = (text: string) => (_ev: MouseEvent<HTMLElement> | undefined, $model: HxObject<any>, _context: HxContext) => {
		console.log(`${text} clicked`, $model);
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleCustomAction = (text: string) => (_ev: MouseEvent<HTMLElement> | undefined, $model: HxObject<any>, context: HxContext) => {
		console.log(`${text} clicked`, $model);
		context.overlayInstance?.hide();
	};

	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
			<HxButton $model={model} color="primary" text="Custom 10s Auto Close Toast" onClick={openCustomDelayToast}/>
			<HxButton $model={model} color="warn" text="Persistent Toast (No Auto Close)"
			          onClick={openPersistentToast}/>
			<HxButton $model={model} color="primary" text="Toast With Custom Actions" onClick={openCustomButtonToast}/>
			<HxButton $model={model} color="primary" text="Toast With Custom Icon" onClick={openCustomIconToast}/>

			{/* Custom auto close delay: 10 seconds */}
			<HxInfoToast id="custom-delay-toast"
			             role="toast-tr"
			             message="This toast will automatically close after 10 seconds"
			             dismissDelay={10000}
			             onDismissed={handleAction('Dismiss')}/>

			{/* Persistent toast: no auto close, requires manual dismissal */}
			<HxWarnToast id="persistent-toast"
			             role="toast-tr"
			             message="This toast will stay open until you manually dismiss it"
			             dismissDelay={false}
			             onDismissed={handleAction('Dismiss')}/>

			{/* Toast with custom action buttons */}
			<HxToast id="custom-btn-toast"
			         type="question"
			         role="toast-tr"
			         message="New version available. Would you like to update now?"
			         dismissDelay={false}
			         tailingFooter={<HxFlex gapX="xs">
				         <HxButton variant="ghost" color="waive" text="Later"
				                   onClick={handleCustomAction('Later')}/>
				         <HxButton variant="solid" color="primary" text="Update"
				                   onClick={handleCustomAction('Update')}/>
			         </HxFlex>}/>

			{/* Toast with custom icon */}
			<HxToast id="custom-icon-toast"
			         role="toast-tr"
			         type={<MagnifyingGlass style={{color: '#faad14'}}/>}
			         message="New achievement unlocked: First Toast!"
			         dismissDelay={5000}/>
		</div>
	);
};

export const Custom: Story = {
	render: () => (
		<HxOverlayProvider>
			<CustomToastDemo/>
		</HxOverlayProvider>
	),
	args: {
		id: 'custom-toast',
		type: 'info',
		message: 'Custom toast content'
	}
};
