import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-ignore
import React, {useState} from 'react';
import {HxBox} from '../box';
import {HxButton} from '../button';
import {HxLabel} from '../label';
import {HxPopup, type HxPopupType} from './popup';

const meta: Meta<HxPopupType> = {
	title: 'Components/Overlay/Popup',
	component: HxPopup,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		visible: {
			name: 'Visible',
			description: 'Controls whether the popup is displayed',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'true'}
			}
		}
	}
};

export default meta;

type Story = StoryObj<typeof HxPopup>;

export const Default: Story = {
	args: {
		children: <div style={{
			background: 'white',
			padding: '24px',
			borderRadius: '8px',
			boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
			width: '400px'
		}}>
			<h3 style={{margin: '0 0 16px 0'}}>Default Popup</h3>
			<p style={{margin: '0 0 16px 0'}}>This is a basic popup rendered via React Portal to document.body.</p>
			<HxButton text="Close"/>
		</div>
	}
};

export const ControlledVisibility: Story = {
	render: (args) => {
		const [visible, setVisible] = useState(false);

		return <>
			<HxButton onClick={() => setVisible(true)} text="Open Popup"/>
			{visible && <HxPopup {...args} style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: 'rgba(0, 0, 0, 0.5)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<div style={{
					background: 'white',
					padding: '24px',
					borderRadius: '8px',
					width: '400px'
				}}>
					<h3 style={{margin: '0 0 16px 0'}}>Controlled Popup</h3>
					<p style={{margin: '0 0 16px 0'}}>This popup visibility is controlled by state.</p>
					<HxButton onClick={() => setVisible(false)} text="Close"/>
				</div>
			</HxPopup>}
		</>;
	}
};

export const ModelPropagation: Story = {
	render: (args) => {
		const [visible, setVisible] = useState(false);
		const [model] = useState(() => ERO.reactive({
			user: {
				name: 'John Doe',
				email: 'john@example.com'
			}
		}));

		return <>
			<HxButton onClick={() => setVisible(true)} text="Open User Info Popup"/>
			{/* @ts-expect-error $field detected as never, don't know why */}
			{visible && <HxPopup {...args} $model={model} $field="user" style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: 'rgba(0, 0, 0, 0.5)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<HxBox border borderRadius="lg" paddingX="lg" paddingT="lg" paddingB="lg"
				       style={{background: 'white', width: '400px'}}>
					<h3 style={{margin: '0 0 16px 0'}}>User Information</h3>
					<div style={{marginBottom: '8px'}}>
						<HxLabel text="Name: "/>
						{/* @ts-expect-error ignore the type check of model */}
						<HxLabel $model={model.user} $field="name" color="primary"/>
					</div>
					<div style={{marginBottom: '16px'}}>
						<HxLabel text="Email: "/>
						{/* @ts-expect-error ignore the type check of model */}
						<HxLabel $model={model.user} $field="email" color="info"/>
					</div>
					<HxButton onClick={() => setVisible(false)} text="Close"/>
				</HxBox>
			</HxPopup>}
		</>;
	}
};

export const CustomStyledPopup: Story = {
	render: (args) => {
		const [visible, setVisible] = useState(false);

		return <>
			<HxButton onClick={() => setVisible(true)} color="primary" text="Open Custom Popup"/>
			<HxPopup {...args} visible={visible} style={{
				position: 'fixed',
				top: '20px',
				right: '20px'
			}}>
				<div style={{
					background: '#f6ffed',
					border: '1px solid #b7eb8f',
					padding: '12px 16px',
					borderRadius: '6px',
					width: '300px'
				}}>
					<h4 style={{margin: '0 0 8px 0', color: '#52c41a'}}>Success Notification</h4>
					<p style={{margin: 0, color: '#389e0d', fontSize: '14px'}}>
						Operation completed successfully!
					</p>
					<HxButton onClick={() => setVisible(false)} style={{marginTop: '12px'}} text="Close"/>
				</div>
			</HxPopup>
		</>;
	}
};
