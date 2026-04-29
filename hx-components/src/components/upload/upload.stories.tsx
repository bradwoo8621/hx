import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../grid';
import type {HxUploadColor, HxUploadTriggerVariant} from './types.ts';
import {HxUpload} from './upload';

const meta: Meta<typeof HxUpload> = {
	title: 'Components/Basic/Upload',
	component: HxUpload,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		color: {
			control: 'select',
			options: ['primary', 'success', 'danger', 'warning', 'info', 'waive'],
			description: 'Upload component color theme',
			defaultValue: 'primary'
		},
		triggerVariant: {
			control: 'select',
			options: ['solid', 'outline', 'ghost', 'dashed', 'text', 'dnd'],
			description: 'Upload trigger type (button variants or drag-and-drop)',
			defaultValue: 'solid'
		},
		listVariant: {
			control: 'select',
			options: ['list', 'gallery'],
			description: 'Upload file list display type (ignored when trigger is dnd, treated as list)',
			defaultValue: 'list'
		},
		maxFileCount: {
			control: 'number',
			description: 'Maximum number of files allowed to upload',
			defaultValue: undefined
		},
		maxFileSize: {
			control: 'number',
			description: 'Maximum file size allowed per file (in bytes)',
			defaultValue: undefined
		},
		buttonUploadKey: {
			control: 'text',
			description: 'Custom text for button upload trigger',
			defaultValue: '~HxCommon.ButtonUpload'
		},
		galleryUploadKey: {
			control: 'text',
			description: 'Custom text for gallery upload trigger',
			defaultValue: '~HxCommon.GalleryUpload'
		},
		dndUploadKey: {
			control: 'text',
			description: 'Custom title text for drag-and-drop upload trigger',
			defaultValue: '~HxCommon.DndUpload'
		},
		dndDescKey: {
			control: 'text',
			description: 'Custom description text for drag-and-drop upload trigger',
			defaultValue: undefined
		},
		$disabled: {
			control: 'boolean',
			description: 'Whether the upload component is disabled',
			defaultValue: false
		}
	}
};

export default meta;
type Story = StoryObj<typeof HxUpload>;

/**
 * Default upload component with button trigger and list view
 */
export const Default: Story = {
	args: {
		$model: ERO.reactive({files: []}),
		$field: 'files'
	}
};

/**
 * Different color themes for upload component
 */
export const ButtonColorAndVariants: Story = {
	args: {
		$model: ERO.reactive({}),
		// @ts-expect-error ignore check
		read: (_1, _2, value) => value || []
	},
	render: (args) => {
		const {$model, read} = args;

		const colors: Array<HxUploadColor> = ['primary', 'success', 'info', 'warn', 'danger', 'waive'];
		const variant: Array<HxUploadTriggerVariant> = ['solid', 'outline', 'ghost'];
		const disabled = [false, true];

		return <HxGrid gapX="sm" gapY="sm">
			{variant.map(variant => {
				return colors.map(color => {
					return disabled.map(disabled => {
						// @ts-expect-error ignore check
						return <HxUpload $model={$model} $field={`${variant}-${color}-${disabled}`}
						                 color={color} triggerVariant={variant}
						                 read={read}
						                 $disabled={disabled}
						                 gCols={2}
						                 key={`${variant}-${color}-${disabled}`}/>;
					});
				});
			})}
		</HxGrid>;
	}
};

/**
 * Gallery upload mode for image uploads
 */
export const GalleryColors: Story = {
	args: {
		$model: ERO.reactive({}),
		// @ts-expect-error ignore check
		read: (_1, _2, value) => value || []
	},
	render: (args) => {
		const {$model, read} = args;

		const colors: Array<HxUploadColor> = ['primary', 'success', 'info', 'warn', 'danger', 'waive'];
		const disabled = [false, true];

		return <HxGrid gapX="sm" gapY="sm">
			{colors.map(color => {
				return disabled.map(disabled => {
					// @ts-expect-error ignore check
					return <HxUpload $model={$model} $field={`${color}-${disabled}`}
					                 color={color} listVariant="gallery"
					                 read={read}
					                 $disabled={disabled}
					                 gCols={6}
					                 key={`${color}-${disabled}`}/>;
				});
			})}
		</HxGrid>;
	}
};

/**
 * Drag-and-drop upload mode
 */
export const DragAndDropColors: Story = {
	args: {
		$model: ERO.reactive({}),
		// @ts-expect-error ignore check
		read: (_1, _2, value) => value || []
	},
	render: (args) => {
		const {$model, read} = args;

		const colors: Array<HxUploadColor> = ['primary', 'success', 'info', 'warn', 'danger', 'waive'];
		const disabled = [false, true];

		return <HxGrid gapX="sm" gapY="sm">
			{colors.map(color => {
				return disabled.map(disabled => {
					// @ts-expect-error ignore check
					return <HxUpload $model={$model} $field={`${color}-${disabled}`}
					                 color={color} triggerVariant="dnd"
					                 read={read}
					                 dndDescKey="Supports multiple file upload, max 10 files, each under 10MB"
					                 $disabled={disabled}
					                 gCols={6}
					                 key={`${color}-${disabled}`}/>;
				});
			})}
		</HxGrid>;
	}
};

/**
 * Upload component with file restrictions
 */
export const FileRestrictions: Story = {
	args: {
		$model: ERO.reactive({files: []}),
		$field: 'files',
		maxFileCount: 5,
		maxFileSize: 10 * 1024 * 1024, // 10MB
		buttonUploadKey: 'Upload files (max 5, 10MB each)'
	}
};

/**
 * Custom text for upload triggers
 */
export const CustomText: Story = {
	args: {
		$model: ERO.reactive({files1: [], files2: [], files3: []})
	},
	render: (args) => {
		const {$model} = args;

		return <div style={{display: 'flex', flexDirection: 'column', gap: '24px', width: '480px'}}>
			{/* @ts-expect-error ignore check */}
			<HxUpload $model={$model} $field="files1"
			          buttonUploadKey="Select Files to Upload"
			          listVariant="list"
			/>
			{/* @ts-expect-error ignore check */}
			<HxUpload $model={$model} $field="files2"
			          galleryUploadKey="Select Files"
			          listVariant="gallery"
			/>
			{/* @ts-expect-error ignore check */}
			<HxUpload $model={$model} $field="files3"
			          triggerVariant="dnd"
			          dndUploadKey="Drop your files here"
			          dndDescKey="JPG, PNG, PDF only. Max 5 files."
			/>
		</div>;
	}
};
