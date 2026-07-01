import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {type MouseEvent} from 'react';
import {
	HxAlert,
	HxButton,
	type HxContext,
	HxErrorAlert,
	HxFlex,
	HxInfoAlert,
	type HxObject,
	HxOverlayProvider,
	HxQuestionAlert,
	HxSuccessAlert,
	HxWarnAlert,
	MagnifyingGlass,
	useHxOverlay
} from '../src';

const meta: Meta<typeof HxAlert> = {
	title: 'Components/Overlay/Alert',
	component: HxAlert,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		kind: {
			name: 'Alert Kind',
			description: 'Kind of alert, determines icon and color scheme',
			control: {type: 'select'},
			options: ['info', 'success', 'warn', 'error', 'question']
		},
		message: {
			name: 'Message',
			description: 'Content to display in the alert',
			control: 'text'
		},
		width: {
			name: 'Width',
			description: 'Width of the alert dialog',
			control: 'text'
		},
		zIndex: {
			name: 'Z-Index',
			description: 'Stack order of the alert',
			control: 'number'
		}
	}
};

export default meta;

type Story = StoryObj<typeof HxAlert>;

const AlertDemo = () => {
	const overlay = useHxOverlay();
	const model = ERO.reactive({});

	const openInfoAlert = () => {
		overlay.show('info-alert', model);
	};

	const openSuccessAlert = () => {
		overlay.show('success-alert', model);
	};

	const openWarnAlert = () => {
		overlay.show('warn-alert', model);
	};

	const openErrorAlert = () => {
		overlay.show('error-alert', model);
	};

	const openQuestionAlert = () => {
		overlay.show('question-alert', model);
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleConfirm = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		console.log('Confirmed');
		context.overlayInstance?.hide();
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleYes = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		console.log('User clicked Yes');
		context.overlayInstance?.hide();
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleNo = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		console.log('User clicked No');
		context.overlayInstance?.hide();
	};

	return (
		<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
			<HxButton $model={model} color="info" text="Info Alert" onClick={openInfoAlert}/>
			<HxButton $model={model} color="success" text="Success Alert" onClick={openSuccessAlert}/>
			<HxButton $model={model} color="warn" text="Warning Alert" onClick={openWarnAlert}/>
			<HxButton $model={model} color="danger" text="Error Alert" onClick={openErrorAlert}/>
			<HxButton $model={model} color="primary" text="Question Alert" onClick={openQuestionAlert}/>

			{/* Info Alert Template */}
			<HxInfoAlert id="info-alert" message="This is an informational message to notify users of general updates."
			             confirm={handleConfirm}/>

			{/* Success Alert Template */}
			<HxSuccessAlert id="success-alert" message="Operation completed successfully! Your changes have been saved."
			                confirm={handleConfirm}/>

			{/* Warning Alert Template */}
			<HxWarnAlert id="warn-alert" message="Warning: This action cannot be undone. Please proceed with caution."
			             confirm={handleConfirm}/>

			{/* Error Alert Template */}
			<HxErrorAlert id="error-alert"
			              message="Error: Failed to save changes. Please check your input and try again."
			              confirm={handleConfirm}/>

			{/* Question Alert Template */}
			<HxQuestionAlert id="question-alert"
			                 message="Are you sure you want to delete this item? This action cannot be reversed."
			                 yes={handleYes} no={handleNo}/>
		</div>
	);
};

export const Basic: Story = {
	render: () => (
		<HxOverlayProvider>
			<AlertDemo/>
		</HxOverlayProvider>
	),
	args: {
		id: 'info-alert',
		kind: 'info',
		message: 'This is a sample alert message',
		width: 'sm'
	}
};

const CustomAlertDemo = () => {
	const overlay = useHxOverlay();
	const model = ERO.reactive({});

	const openCustomAlert = () => {
		overlay.show('custom-alert', model);
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleAction1 = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		console.log('Action 1 clicked');
		context.overlayInstance?.hide();
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleAction2 = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		console.log('Action 2 clicked');
		context.overlayInstance?.hide();
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleAction3 = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
		console.log('Action 3 clicked');
		context.overlayInstance?.hide();
	};

	return (
		<div>
			<HxButton $model={model} color="primary" text="Open Custom Alert" onClick={openCustomAlert}/>

			<HxAlert id="custom-alert" kind={<MagnifyingGlass style={{color: '#faad14'}}/>} width="md"
			         message="This is a custom alert with a custom icon and multiple action buttons."
			         leadingFooter={<HxButton variant="ghost" color="info" text="Action 1" onClick={handleAction1}/>}
			         tailingFooter={<HxFlex gapX="xs">
				         <HxButton variant="ghost" color="waive" text="Cancel" onClick={handleAction2}/>
				         <HxButton variant="solid" color="primary" text="Confirm" onClick={handleAction3}/>
			         </HxFlex>}/>
		</div>
	);
};

const FocusAlertDemo = () => {
		const overlay = useHxOverlay();
		const model = ERO.reactive({});

		const openAlert = () => overlay.show('focus-alert', model);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const handleConfirm = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
			console.log('Confirmed');
			context.overlayInstance?.hide();
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const handleCancel = (_e: MouseEvent<HTMLButtonElement>, _model: HxObject<any>, context: HxContext) => {
			console.log('Cancelled');
			context.overlayInstance?.hide();
		};

		return (
			<div>
				<HxButton $model={model} color="primary" text="Open Focus Test Alert" onClick={openAlert}/>
				<HxQuestionAlert id="focus-alert"
				                 message="Press Tab to cycle between No and Yes buttons."
				                 yes={handleConfirm} no={handleCancel}/>
			</div>
		);
	};

	export const Focus: Story = {
		render: () => (
			<HxOverlayProvider>
				<FocusAlertDemo/>
			</HxOverlayProvider>
		),
		args: {
			id: 'focus-alert',
			kind: 'info',
			message: 'Focus test alert'
		}
	};

	export const Custom: Story = {
	render: () => (
		<HxOverlayProvider>
			<CustomAlertDemo/>
		</HxOverlayProvider>
	),
	args: {
		id: 'custom-alert',
		kind: 'info',
		message: 'Custom alert content'
	}
};
