import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {Fragment, useEffect, useState} from 'react';
import {
	House,
	HxButton,
	HxConsole,
	HxFmt,
	HxFragment,
	HxLabel,
	type HxLabelType,
	StdHxLanguages,
	useForceUpdate,
	useHxLanguage
} from '../src';

const meta: Meta<HxLabelType> = {
	title: 'Components/Basic/Label',
	component: HxLabel,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		text: {
			name: 'Text Content',
			description: 'Static text content or i18n key starting with ~',
			control: 'text'
		},
		color: {
			name: 'Color',
			description: 'Text color theme',
			control: {
				type: 'select'
			},
			options: ['primary', 'success', 'warn', 'danger', 'info', 'waive'],
			table: {
				defaultValue: {summary: 'default'}
			}
		},
		opaque: {
			name: 'Opaque Background',
			description: 'Whether to use solid background',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		borderRadius: {
			name: 'Border Radius',
			description: 'Size of border radius',
			control: {
				type: 'select'
			},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			table: {
				defaultValue: {summary: 'none'}
			}
		},
		clickable: {
			name: 'Clickable',
			description: 'Show pointer cursor, to indicate the label is clickable',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		hoverable: {
			name: 'Hoverable',
			description: 'Apply hover background while the mouse is over the label',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		hovered: {
			name: 'Hovered (Forced)',
			description: 'Force the hover visual state, for controlled hover',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		active: {
			name: 'Active (Forced)',
			description: 'Force the active visual state, for controlled selection',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		indent: {
			name: 'Indent',
			description: 'Apply text indent as horizontal padding, same as paddingX="text-indent"',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		paddingX: {
			name: 'Horizontal Padding',
			description: 'Horizontal padding size',
			control: {
				type: 'select'
			},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'text-indent'],
			table: {
				defaultValue: {summary: 'none'}
			}
		},
		paddingY: {
			name: 'Vertical Padding',
			description: 'Vertical padding size',
			control: {
				type: 'select'
			},
			options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
			table: {
				defaultValue: {summary: 'none'}
			}
		},
		valueUseI18N: {
			name: 'Model Value Uses I18N',
			description: 'Treat the value read from the reactive model as an i18n key',
			control: 'boolean',
			table: {
				defaultValue: {summary: 'false'}
			}
		},
		format: {
			name: 'Value Format',
			description: 'Format applied to the text or model value, e.g. df, dtf, nf2, ng, or a custom format function',
			control: 'text'
		},
		$model: {
			name: 'Data Model',
			control: 'text',
			table: {disable: true}
		},
		$field: {
			name: 'Field name of Data Model',
			control: 'text',
			table: {disable: true}
		},
		$visible: {
			name: 'Visible',
			control: 'boolean'
		},
		$disabled: {
			name: 'Disabled',
			control: 'boolean'
		}
	}
};

export default meta;

type Story = StoryObj<typeof HxLabel>;

export const Default: Story = {
	args: {
		text: 'Default Label Text'
	}
};

export const ColorVariants: Story = {
	render: (args) => {
		return <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
			<HxLabel {...args} text="Primary Color" color="primary" paddingX="lg"/>
			<HxLabel {...args} text="Success Color" color="success" paddingX="lg"/>
			<HxLabel {...args} text="Warning Color" color="warn" paddingX="lg"/>
			<HxLabel {...args} text="Danger Color" color="danger" paddingX="lg"/>
			<HxLabel {...args} text="Info Color" color="info" paddingX="lg"/>
			<HxLabel {...args} text="Waive Color" color="waive" paddingX="lg"/>
		</div>;
	}
};

export const OpaqueBackground: Story = {
	render: (args) => {
		const colors = ['primary', 'success', 'warn', 'danger', 'info', 'waive'] as const;

		return <div style={{
			display: 'flex',
			flexDirection: 'column',
			gap: '16px',
			padding: '20px',
			background: '#f5f5f5'
		}}>
			<div style={{fontSize: '12px', color: '#888'}}>
				opaque=false renders colored text on the page background,
				opaque=true renders a colored chip with contrast text
			</div>
			<div style={{
				display: 'grid',
				gridTemplateColumns: '80px 220px 220px',
				gap: '12px 16px',
				alignItems: 'center'
			}}>
				<div style={{fontSize: '12px', color: '#888'}}>color</div>
				<div style={{fontSize: '12px', color: '#888'}}>opaque=false</div>
				<div style={{fontSize: '12px', color: '#888'}}>opaque=true</div>
				<div style={{fontSize: '12px', color: '#888'}}>no color</div>
				<HxLabel {...args} text="Transparent" opaque={false} paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} text="Opaque" opaque borderRadius="sm" paddingX="lg" paddingY="xs"/>
				{colors.map(color => {
					return <Fragment key={color}>
						<div style={{fontSize: '12px', color: '#888'}}>{color}</div>
						<HxLabel {...args} text={`Transparent ${color}`} color={color} opaque={false} paddingX="lg"
						         paddingY="xs"/>
						<HxLabel {...args} text={`Opaque ${color}`} color={color} opaque borderRadius="sm"
						         paddingX="lg" paddingY="xs"/>
					</Fragment>;
				})}
			</div>
			<div style={{fontSize: '12px', color: '#888', marginTop: '8px', maxWidth: '640px'}}>
				state interactions with opaque: an opaque colored chip takes the hover shade of its own color
				when hovered and the focus shade on the active state, an opaque chip without color takes the
				neutral hover and active backgrounds
			</div>
			<div style={{display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap'}}>
				<HxLabel {...args} text="opaque, hovered (forced)" color="primary" opaque hovered borderRadius="sm"
				         paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} text="opaque, active (forced)" color="primary" opaque active borderRadius="sm"
				         paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} text="opaque, no color, hoverable (hover me)" opaque hoverable borderRadius="sm"
				         paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} text="opaque, color, hoverable (hover me)" color="primary" opaque hoverable
				         borderRadius="sm" paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} text="transparent, hoverable (hover me)" color="primary" hoverable paddingX="lg"
				         paddingY="xs"/>
			</div>
		</div>;
	}
};

export const BorderRadiusVariants: Story = {
	render: (args) => {
		const radii = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

		return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px'}}>
			<div style={{fontSize: '12px', color: '#888'}}>
				the full border radius scale, shown on opaque chips so the corners are visible
			</div>
			{radii.map(radius => {
				return <HxLabel {...args} key={radius} text={`borderRadius=${radius}`} color="primary" opaque
				                 borderRadius={radius} paddingX="lg" paddingY="xs"/>;
			})}
			<div style={{fontSize: '12px', color: '#888', marginTop: '8px'}}>
				the radius applies to hover and active backgrounds as well, hover the labels below
			</div>
			<div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
				<HxLabel {...args} text="hoverable, no radius" hoverable paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} text="hoverable, radius=lg" hoverable borderRadius="lg" paddingX="lg"
				         paddingY="xs"/>
				<HxLabel {...args} text="hovered, radius=lg" hovered borderRadius="lg" paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} text="active, radius=lg" active borderRadius="lg" paddingX="lg" paddingY="xs"/>
			</div>
		</div>;
	}
};

export const ReactiveLabel: Story = {
	render: (args) => {
		const [model] = useState(() => ERO.reactive({
			user: {
				name: 'John Doe',
				email: 'john@example.com'
			}
		}));

		return <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
			<HxLabel {...args} text="User Name: "/>
			<HxLabel {...args} $model={model} $field="user.name" color="primary"/>
			<br/>
			<HxLabel {...args} text="Email: "/>
			<HxLabel {...args} $model={model} $field="user.email" color="info"/>
		</div>;
	}
};

export const CheckMessageRole: Story = {
	render: (args) => {
		return <div style={{width: '300px'}}>
			<HxLabel {...args} text="This is an error message for form validation" data-hx-label-check-msg=""
			         color="danger"/>
		</div>;
	}
};

export const PaddingVariants: Story = {
	render: (args) => {
		return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px'}}>
			<div style={{fontSize: '12px', color: '#888'}}>
				paddingX scale, rendered with opaque background so the padding is visible
			</div>
			<HxLabel {...args} text="paddingX=none" color="primary" opaque paddingX="none" paddingY="xs"/>
			<HxLabel {...args} text="paddingX=xs" color="primary" opaque paddingX="xs" paddingY="xs"/>
			<HxLabel {...args} text="paddingX=sm" color="primary" opaque paddingX="sm" paddingY="xs"/>
			<HxLabel {...args} text="paddingX=md" color="primary" opaque paddingX="md" paddingY="xs"/>
			<HxLabel {...args} text="paddingX=lg" color="primary" opaque paddingX="lg" paddingY="xs"/>
			<HxLabel {...args} text="paddingX=xl" color="primary" opaque paddingX="xl" paddingY="xs"/>
			<HxLabel {...args} text="paddingX=text-indent" color="primary" opaque paddingX="text-indent"
			         paddingY="xs"/>
			<div style={{fontSize: '12px', color: '#888', marginTop: '8px'}}>paddingY scale</div>
			<HxLabel {...args} text="paddingY=none" color="success" opaque paddingX="lg" paddingY="none"/>
			<HxLabel {...args} text="paddingY=sm" color="success" opaque paddingX="lg" paddingY="sm"/>
			<HxLabel {...args} text="paddingY=xl" color="success" opaque paddingX="lg" paddingY="xl"/>
			<div style={{fontSize: '12px', color: '#888', marginTop: '8px'}}>
				indent, keeps content inline indented, same as paddingX="text-indent"
			</div>
			<HxLabel {...args} text="indent" color="info" opaque indent paddingY="xs"/>
		</div>;
	}
};

export const InteractiveStates: Story = {
	render: (args) => {
		const [$model] = useState(() => ERO.reactive({}));
		const colors = ['primary', 'success', 'warn', 'danger', 'info', 'waive'] as const;

		return <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
			<div style={{fontSize: '12px', color: '#888', maxWidth: '760px'}}>
				clickable and hoverable react to the mouse, hovered and active are forced states for controlled
				usage. A plain label takes the neutral hover and active background, an opaque colored chip takes
				the hover shade of its own color when hovered and the focus shade on the active state
			</div>
			<div style={{fontSize: '12px', color: '#888'}}>plain labels</div>
			<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
				<HxLabel {...args} $model={$model} text="plain" paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="clickable (click me)" clickable paddingX="lg" paddingY="xs"
				         onClick={HxConsole.log}/>
				<HxLabel {...args} $model={$model} text="hoverable (hover me)" hoverable paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="hovered (forced)" hovered paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="active (forced)" active paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="hoverable + active" hoverable active paddingX="lg"
				         paddingY="xs"/>
			</div>
			<div style={{fontSize: '12px', color: '#888'}}>
				opaque chips without color, hover the hoverable one
			</div>
			<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
				<HxLabel {...args} $model={$model} text="opaque" opaque borderRadius="sm" paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="opaque + hoverable (hover me)" opaque hoverable
				         borderRadius="sm" paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="opaque + hovered (forced)" opaque hovered borderRadius="sm"
				         paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="opaque + active (forced)" opaque active borderRadius="sm"
				         paddingX="lg" paddingY="xs"/>
			</div>
			<div style={{fontSize: '12px', color: '#888'}}>
				opaque colored chips, hover any of them to see the hover shade of its own color
			</div>
			<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
				{colors.map(color => {
					return <HxLabel {...args} $model={$model} key={color} color={color} opaque hoverable
					                 borderRadius="sm" text={`${color} (hover me)`} paddingX="lg" paddingY="xs"/>;
				})}
			</div>
			<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
				<HxLabel {...args} $model={$model} text="primary + hovered (forced)" color="primary" opaque hovered
				         borderRadius="sm" paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="primary + active (forced)" color="primary" opaque active
				         borderRadius="sm" paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="primary + hoverable + active" color="primary" opaque
				         hoverable active borderRadius="sm" paddingX="lg" paddingY="xs"/>
			</div>
		</div>;
	}
};

export const DisabledStates: Story = {
	render: (args) => {
		const [$model] = useState(() => ERO.reactive({locked: false}));
		const isLocked = () => ERO.getValue($model, 'locked') === true;

		return <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
			<div style={{fontSize: '12px', color: '#888', maxWidth: '760px'}}>
				a disabled label drops its color and its opaque chip color, an opaque chip takes the neutral
				disabled background instead
			</div>
			<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
				<HxLabel {...args} $model={$model} text="disabled" $disabled paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="disabled + color" $disabled color="primary" paddingX="lg"
				         paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="disabled + opaque" $disabled opaque borderRadius="sm"
				         paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="disabled + opaque + color" $disabled opaque color="danger"
				         borderRadius="sm" paddingX="lg" paddingY="xs"/>
			</div>
			<div style={{fontSize: '12px', color: '#888'}}>
				no hover or active background is applied on a disabled label, hover the first one
			</div>
			<div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
				<HxLabel {...args} $model={$model} text="disabled + clickable + hoverable (hover me)" $disabled
				         clickable hoverable paddingX="lg" paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="disabled + hovered (forced)" $disabled hovered paddingX="lg"
				         paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="disabled + active (forced)" $disabled active paddingX="lg"
				         paddingY="xs"/>
				<HxLabel {...args} $model={$model} text="disabled + opaque + color + active" $disabled opaque
				         color="primary" active borderRadius="sm" paddingX="lg" paddingY="xs"/>
			</div>
			<div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
				<HxButton $model={$model} text="Toggle locked"
				          onClick={() => ERO.setValue($model, 'locked', !isLocked())}/>
				<HxLabel {...args} $model={$model} text="disabled by model.locked" paddingX="lg" paddingY="xs"
				         $disabled={{on: 'locked', handle: isLocked, default: isLocked}}/>
			</div>
		</div>;
	}
};

export const ReactiveVisibility: Story = {
	render: (args) => {
		const [$model] = useState(() => ERO.reactive({showDetail: true}));
		const isVisible = () => ERO.getValue($model, 'showDetail') === true;

		return <div style={{display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start'}}>
			<HxButton $model={$model} text="Toggle showDetail"
			          onClick={() => ERO.setValue($model, 'showDetail', !isVisible())}/>
			<HxLabel {...args} $model={$model} text="Always visible" color="info" paddingX="lg" paddingY="xs"/>
			<HxLabel {...args} $model={$model} text="Shown when model.showDetail is true" color="primary"
			         paddingX="lg" paddingY="xs"
			         $visible={{on: 'showDetail', handle: isVisible, default: isVisible}}/>
			<div style={{fontSize: '12px', color: '#888'}}>
				The label below keeps its DOM node, it is hidden by $visible=false only
			</div>
			<HxLabel {...args} $model={$model} text="Never shown" color="danger" paddingX="lg" paddingY="xs"
			         $visible={false}/>
		</div>;
	}
};

export const ModelBinding: Story = {
	render: (args) => {
		const [$model] = useState(() => ERO.reactive({
			user: {firstName: 'John', lastName: 'Doe'},
			status: 'active'
		}));

		return <div style={{display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start'}}>
			<div style={{fontSize: '12px', color: '#888'}}>
				a model bound label repaints when its owner repaints, or when a $change monitor asks for a repaint
			</div>
			<HxLabel {...args} $model={$model} $field="user.firstName" color="primary" paddingX="lg" paddingY="xs"
			         $change={{on: 'user.firstName', handle: () => 'repaint'}}/>
			<HxLabel {...args} $model={$model} $field="user.lastName" color="primary" paddingX="lg" paddingY="xs"
			         $change={{on: 'user.lastName', handle: () => 'repaint'}}/>
			<HxLabel {...args} $model={$model} $field="status" color="success" paddingX="lg" paddingY="xs"
			         $change={{on: 'status', handle: () => 'repaint'}}/>
			<div style={{display: 'flex', gap: '12px'}}>
				<HxButton $model={$model} text="Rename"
				          onClick={() => ERO.setValue($model, 'user.firstName', 'Jane')}/>
				<HxButton $model={$model} text="Toggle status"
				          onClick={() => ERO.setValue($model, 'status', ERO.getValue($model, 'status') === 'active'
					          ? 'inactive'
					          : 'active')}/>
			</div>
		</div>;
	}
};

// Install a custom format, to be used by the ValueFormatting story below
HxFmt.install('label-amount', (value) => `$ ${Number(value).toFixed(2)}`);

export const ValueFormatting: Story = {
	render: (args) => {
		const [$model] = useState(() => ERO.reactive({
			createdAt: '2026-09-14T10:20:30',
			amount: 12345.678,
			quantity: 1000000
		}));

		return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px'}}>
			<HxLabel {...args} $model={$model} $field="createdAt" format="df" color="primary" paddingX="lg"
			         paddingY="xs"/>
			<HxLabel {...args} $model={$model} $field="createdAt" format="dtf" color="primary" paddingX="lg"
			         paddingY="xs"/>
			<HxLabel {...args} $model={$model} $field="amount" format="nf2" color="success" paddingX="lg"
			         paddingY="xs"/>
			<HxLabel {...args} $model={$model} $field="quantity" format="ng" color="success" paddingX="lg"
			         paddingY="xs"/>
			<HxLabel {...args} $model={$model} $field="amount" format="label-amount" color="warn" paddingX="lg"
			         paddingY="xs"/>
			<HxLabel {...args} $model={$model} $field="amount"
			         format={(value) => `${Number(value).toFixed(2)} USD`} color="warn" paddingX="lg"
			         paddingY="xs"/>
		</div>;
	}
};

export const RichContentText: Story = {
	render: (args) => {
		const [$model] = useState(() => ERO.reactive({
			user: {firstName: 'John', lastName: 'Doe'},
			order: {amount: 1234.5}
		}));

		return <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
			<div style={{fontSize: '12px', color: '#888'}}>
				a ReactNode text is composed as is, HxFragment passes $model down to the nested labels
			</div>
			<HxLabel {...args} $model={$model} color="primary" paddingX="lg" paddingY="xs"
			         text={<HxFragment $model={$model}>
				         <HxLabel $field="user.firstName"/>
				         <HxLabel text=" "/>
				         <HxLabel $field="user.lastName"/>
			         </HxFragment>}/>
			<HxLabel {...args} $model={$model} color="success" paddingX="lg" paddingY="xs"
			         text={<HxFragment $model={$model}>
				         <HxLabel text="Total: "/>
				         <HxLabel $field="order.amount" format="nf2"/>
			         </HxFragment>}/>
		</div>;
	}
};

const LabelI18nDemo = () => {
	const language = useHxLanguage();

	const forceUpdate = useForceUpdate();
	useEffect(() => {
		const onLanguageChange = () => forceUpdate();
		language.on(onLanguageChange);
		return () => {
			language.off(onLanguageChange);
		};
	}, [forceUpdate, language]);

	const [$model] = useState(() => ERO.reactive({
		status: '~label.demo.approved'
	}));

	return <div style={{display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start'}}>
		<div style={{display: 'flex', gap: '12px'}}>
			<HxButton $model={$model} text="English" onClick={() => language.switchTo('en')}/>
			<HxButton $model={$model} text="中文" onClick={() => language.switchTo('zh-CN')}/>
		</div>
		<HxLabel text="~label.demo.title" color="primary" paddingX="lg" paddingY="xs"/>
		<HxLabel text="~label.demo.unknown" color="warn" paddingX="lg" paddingY="xs"/>
		<HxLabel text={'\\~label.demo.title'} color="info" paddingX="lg" paddingY="xs"/>
		<div style={{fontSize: '12px', color: '#888'}}>
			value from model, translated by valueUseI18N
		</div>
		<HxLabel $model={$model} $field="status" valueUseI18N color="success" paddingX="lg" paddingY="xs"/>
		<div style={{fontSize: '12px', color: '#888'}}>
			same value from model, no translation without valueUseI18N
		</div>
		<HxLabel $model={$model} $field="status" color="danger" paddingX="lg" paddingY="xs"/>
		<div style={{fontSize: '12px', color: '#888'}}>Current language: {language.current()}</div>
	</div>;
};

// Install label texts for both languages before rendering
StdHxLanguages.merge('en', {
	label: {
		demo: {
			title: 'Account Statement',
			approved: 'Approved',
			rejected: 'Rejected'
		}
	}
});

StdHxLanguages.merge('zh-CN', {
	label: {
		demo: {
			title: '账户对账单',
			approved: '已批准',
			rejected: '已拒绝'
		}
	}
});

export const I18nText: Story = {
	name: 'I18n Text',
	render: () => {
		return <LabelI18nDemo/>;
	}
};

export const InputEmbedIcon: Story = {
	render: (args) => {
		return <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
			<div style={{fontSize: '12px', color: '#888'}}>
				embedded labels are used by HxInput, HxSelect and HxDatetimePicker for in-box icons,
				height and padding follow the input box
			</div>
			<div style={{
				display: 'flex',
				alignItems: 'center',
				gap: '8px',
				width: '320px',
				height: '32px',
				padding: '0 8px',
				border: '1px solid #ddd',
				borderRadius: '4px'
			}}>
				<HxLabel {...args} text={<House marginT={3}/>} data-hx-label-input-embed=""
				         data-hx-label-svg-icon=""/>
				<HxLabel {...args} text="Icon label embedded in input box" data-hx-label-input-embed=""
				         paddingX="sm"/>
			</div>
		</div>;
	}
};

export const CustomStyling: Story = {
	render: (args) => {
		return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px'}}>
			<div style={{fontSize: '12px', color: '#888'}}>
				native span attributes, styles and events are forwarded to the root span
			</div>
			<HxLabel {...args} text="Custom style" title="native title attribute" paddingX="lg" paddingY="xs"
			         style={{border: '1px dashed #999', letterSpacing: '2px'}}/>
			<HxLabel {...args} text="Clickable with event handler" color="primary" clickable paddingX="lg"
			         paddingY="xs" onClick={HxConsole.log}/>
		</div>;
	}
};
