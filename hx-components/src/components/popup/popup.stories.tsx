import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
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
	render: (args) => {
		const [visible, setVisible] = useState(false);

		return <>
			<HxButton onClick={() => setVisible(true)} text="Open Popup"/>
			<HxPopup {...args}
			         mode="modal" border={true}
			         visible={visible} style={{
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
			</HxPopup>
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
			<HxPopup {...args} $model={model} $field="user"
			         mode="modal" transition="opacity"
			         visible={visible} style={{
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
			</HxPopup>
		</>;
	}
};

export const CustomStyledPopup: Story = {
	render: (args) => {
		const [visible, setVisible] = useState(false);

		return <>
			<HxButton onClick={() => setVisible(true)} color="primary" text="Open Custom Popup"/>
			<HxPopup {...args} mode="float" transition="opacity"
			         borderRadius="lg"
			         paddingX="lg" paddingT="md" paddingB="md"
			         visible={visible} style={{
				top: '20px',
				right: '20px',
				background: '#f6ffed',
				width: '300px',
				border: '1px solid #b7eb8f'
			}}>
				<h4 style={{margin: '0 0 8px 0', color: '#52c41a'}}>Success Notification</h4>
				<p style={{margin: 0, color: '#389e0d', fontSize: '14px'}}>
					Operation completed successfully!
				</p>
				<HxButton onClick={() => setVisible(false)} style={{marginTop: '12px'}} text="Close"/>
			</HxPopup>
		</>;
	}
};
