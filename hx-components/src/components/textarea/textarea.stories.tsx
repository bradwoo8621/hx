import {ERO, type ValueChangedEvent} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {useEffect, useState} from 'react';
import type {HxContext} from '../../contexts';
import type {CheckResult, HxObject} from '../../types';
import {HxConsole} from '../../utils';
import {HxInput} from '../input';
import {HxTextarea, type HxTextareaType, HxWithCheckTextarea} from './textarea';

const meta: Meta<HxTextareaType> = {
	title: 'Components/Basic/Textarea',
	component: HxTextarea,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		selectAll: {
			name: 'Select All on Focus',
			description: 'Automatically select all text when textarea is focused',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'true'}
			}
		},
		rows: {
			name: 'Rows',
			description: 'Number of visible text rows',
			control: {type: 'number', min: 2},
			table: {
				defaultValue: {summary: '5'}
			}
		},
		emitChangeOnBlur: {
			name: 'Emit Change on Blur',
			description: 'Update model only when textarea loses focus or Enter is pressed',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		emitChangeDelay: {
			name: 'Emit Change Delay',
			description: 'Debounce delay in milliseconds for model updates (only when emitChangeOnBlur is false)',
			control: {type: 'number', min: 0},
			table: {
				defaultValue: {summary: '150'}
			}
		},
		placeholder: {
			name: 'Placeholder',
			control: 'text'
		},
		$visible: {
			name: 'Visible',
			control: 'boolean'
		},
		$disabled: {
			name: 'Disabled',
			control: 'boolean'
		},
		$readonly: {
			name: 'Readonly',
			control: 'boolean'
		},
		onChange: {
			action: 'changed',
			table: {
				disable: true
			}
		},
		onFocus: {
			action: 'focused',
			table: {
				disable: true
			}
		},
		onBlur: {
			action: 'blurred',
			table: {
				disable: true
			}
		}
	}
};

export default meta;
type Story = StoryObj<typeof HxTextarea>;

export const Default: Story = {
	args: {
		$model: ERO.reactive({}),
		// @ts-expect-error ignore path check
		$field: 'text',
		placeholder: 'Enter some text...',
		autoRows: 10,
		charLimit: 1000,
		onChange: HxConsole.log
	}
};

export const WithValueAndCheck: Story = {
	args: {
		$model: ERO.reactive({text: 'Hello, World!\nThis is a multi-line textarea.\nIt supports line breaks.'}),
		// @ts-expect-error ignore path check
		$field: 'text',
		onChange: HxConsole.log,
		charLimit: 200,
		$check: {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
			handle: (event: ValueChangedEvent, _model: HxObject<any>, _context: HxContext): CheckResult => {
				const {newValue} = event;
				if (newValue == null || newValue.trim().length < 5) {
					return 'Value must be at least 5 characters';
				}
				return (void 0);
			}
		},
		style: {
			minWidth: 600
		}
	},
	render: (args) => {
		return <HxWithCheckTextarea {...args}/>;
	}
};

export const DifferentRows: Story = {
	args: {
		$model: ERO.reactive({text: 'This textarea has 3 rows'}),
		// @ts-expect-error ignore path check
		$field: 'text',
		rows: 3,
		placeholder: '3 rows height'
	}
};

export const Disabled: Story = {
	args: {
		$model: ERO.reactive({text: 'This textarea is disabled\nYou cannot edit this text'}),
		// @ts-expect-error ignore path check
		$field: 'text',
		$disabled: true
	}
};

export const DisabledWithPlaceholder: Story = {
	args: {
		$model: ERO.reactive({text: ''}),
		// @ts-expect-error ignore path check
		$field: 'text',
		$disabled: true,
		placeholder: '~HxCommon.PleaseKeyIn'
	}
};

export const ReadOnly: Story = {
	args: {
		$model: ERO.reactive({text: 'This textarea is read-only\nYou can select and copy text\nbut cannot edit it'}),
		// @ts-expect-error ignore path check
		$field: 'text',
		$readonly: true,
		placeholder: '~HxCommon.PleaseKeyIn'
	}
};

export const ReadOnlyWithPlaceholder: Story = {
	args: {
		$model: ERO.reactive({text: ''}),
		// @ts-expect-error ignore path check
		$field: 'text',
		$readonly: true,
		placeholder: '~HxCommon.PleaseKeyIn'
	}
};

export const SelectAllDisabled: Story = {
	args: {
		$model: ERO.reactive({text: 'Click here - text will not auto-select\nTry selecting text manually'}),
		// @ts-expect-error ignore path check
		$field: 'text',
		selectAll: false,
		onChange: HxConsole.log
	}
};

export const BlurOnlyUpdate: Story = {
	args: {
		$model: ERO.reactive({}),
		// @ts-expect-error ignore path check
		$field: 'text',
		emitChangeOnBlur: true,
		placeholder: 'Updates only when you blur or press Enter...',
		onChange: HxConsole.log
	}
};

export const LongDebounce: Story = {
	args: {
		$model: ERO.reactive({}),
		// @ts-expect-error ignore path check
		$field: 'text',
		emitChangeDelay: 1000,
		placeholder: 'Updates after 1 second of inactivity...',
		onChange: HxConsole.log
	}
};

export const WithReactiveChangeDisplay: Story = {
	render: (args) => {
		const [displayText, setDisplayText] = useState('Initial value: Hello, Reactive!');

		// Create reactive model
		const [model] = useState(() => ERO.reactive({obj: {text: 'Hello, Reactive!'}}));

		// Listen for changes using reactive object mechanism
		useEffect(() => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const handleChange = (event: any) => {
				setDisplayText(`Current value:\n${event.newValue ?? ''}`);
			};

			ERO.on(model, 'obj.text', handleChange);

			return () => {
				ERO.off(model, 'obj.text', handleChange);
			};
		}, [model]);

		return <div style={{display: 'flex', flexDirection: 'column', gap: '12px', width: '400px'}}>
			{/* @ts-expect-error $field detected as never, don't know why */}
			<HxTextarea {...args} $model={model} $field={'obj.text'}
			            placeholder="Type something to see changes..."
			            rows={4}/>
			<div style={{
				padding: '12px',
				border: '1px solid #e0e0e0',
				borderRadius: '4px',
				fontSize: '14px',
				minHeight: '60px',
				whiteSpace: 'pre-wrap'
			}}>
				{displayText}
			</div>
		</div>;
	},
	args: {
		emitChangeDelay: 300
	}
};

export const CompareWithInput: Story = {
	render: (args) => {
		const [model] = useState(() => ERO.reactive({
			inputText: 'first line',
			textareaText1: 'first line',
			textareaText2: 'first line\nsecond line',
			textareaText3: 'first line\nsecond line\nthird line',
			textareaText4: 'first line\nsecond line\nthird line\n4th line',
			textareaText5: 'first line\nsecond line\nthird line\n4th line\n5th line',
			textareaText6: 'first line\nsecond line\nthird line\n4th line\n5th line\n6th line',
			textareaText7: 'first line\nsecond line\nthird line\n4th line\n5th line\n6th line\n7th line',
			textareaText8: 'first line\nsecond line\nthird line\n4th line\n5th line\n6th line\n7th line\n8th line',
			textareaText9: 'first line\nsecond line\nthird line\n4th line\n5th line\n6th line\n7th line\n8th line\n9th line',
			textareaText10: 'first line\nsecond line\nthird line\n4th line\n5th line\n6th line\n7th line\n8th line\n9th line\n10th line'
		}));

		return <div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(3, 1fr)',
				gap: '24px',
				alignItems: 'flex-start',
				width: '700px'
			}}>
			<div>
				<div style={{marginBottom: '8px', fontSize: '14px', fontWeight: 500}}>Input</div>
				<HxInput $model={model} $field="inputText"
				         placeholder="Single line input..."
				         style={{width: '100%'}}
				/>
			</div>
			<div>
				<div style={{marginBottom: '8px', fontSize: '14px', fontWeight: 500}}>Textarea (1 row)</div>
				{/* @ts-expect-error ignore path check */}
				<HxTextarea {...args} $model={model} $field="textareaText1"
				            rows={1}
				            placeholder="Multi-line textarea..."
				            style={{width: '100%'}}
				/>
			</div>
			{[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
				return <div key={n}>
					<div style={{marginBottom: '8px', fontSize: '14px', fontWeight: 500}}>Textarea ({n} row)</div>
					{/* @ts-expect-error ignore path check */}
					<HxTextarea {...args} $model={model} $field={`textareaText${n}`}
					            rows={n}
					            placeholder="Multi-line textarea..."
					            style={{width: '100%'}}
					/>
				</div>;
			})}
		</div>;
	}
};
