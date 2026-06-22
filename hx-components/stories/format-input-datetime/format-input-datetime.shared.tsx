import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {useState} from 'react';
import {
	DateUtils,
	type HxDateTimeDefaultValuesInStr,
	type HxDateTimeDefaultValues,
	type HxDateTimeRelatedFormat,
	HxFormatInput,
	type HxFormatInputDateTimeOptions,
	type HxFormatInputDateTimePattern,
	HxLabel
} from '../../src';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asDisplayValue = (value: any) => {
	if (value === (void 0)) {
		return '[undefined]';
	} else if (value == null) {
		return '[null]';
	} else if (value === '') {
		return '[empty string]';
	} else {
		return (typeof value) + ' [' + value + ']';
	}
};

export const Fixture = ({pattern, label, initialValue, valueFormat, charPlaceholderOnEmpty, defaultValues}: {
	pattern: HxFormatInputDateTimePattern;
	label: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	initialValue: any;
	valueFormat: HxDateTimeRelatedFormat;
	charPlaceholderOnEmpty?: boolean;
	defaultValues?: HxDateTimeDefaultValuesInStr | HxDateTimeDefaultValues;
}) => {
	const [model] = useState(() => ERO.reactive(new Proxy({
		value: initialValue,
		displayValue: asDisplayValue(initialValue),
		parsedInitialValue: (() => {
			const format = DateUtils.parseFormat(valueFormat);
			const parsed = DateUtils.parseValue(String(initialValue), format, true);
			if (parsed === false) {
				return 'Initial value parsed failed.';
			} else {
				return `y=${parsed.year ?? ''}, m=${parsed.month ?? ''}, d=${parsed.day ?? ''}, h=${parsed.hour ?? ''}, n=${parsed.minute ?? ''}, s=${parsed.second ?? ''}`;
			}
		})()
	}, {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		set(target: any, p: string | symbol, newValue: any, receiver: any): boolean {
			if (p === 'value') {
				target.displayValue = asDisplayValue(newValue);
			}
			return Reflect.set(target, p, newValue, receiver);
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		deleteProperty(target: any, p: string | symbol): boolean {
			if (p === 'value') {
				target.displayValue = asDisplayValue(void 0);
			}
			return Reflect.deleteProperty(target, p);
		}
	})));

	const options: HxFormatInputDateTimeOptions | undefined =
		(valueFormat != null || charPlaceholderOnEmpty != null || defaultValues != null)
			? {valueFormat, charPlaceholderOnEmpty, defaultValues}
			: (void 0);

	return <div style={{display: 'flex', flexDirection: 'column', gap: '4px', width: '600px'}}>
		<HxLabel text="Pattern:" style={{marginBottom: '-12px'}}/>
		<HxLabel text={`[${pattern}]`} color="primary"/>
		{options != null
			? <>
				<HxLabel text="Value Format:" style={{marginBottom: '-12px'}}/>
				<HxLabel text={`[${valueFormat}]`} color="info"/>
			</>
			: (void 0)
		}
		<HxLabel text="Parsed Initial Value:" style={{marginBottom: '-12px'}}/>
		<HxLabel $model={model} $field="parsedInitialValue" color="info"/>
		<HxLabel text="Behaviour:" style={{marginBottom: '-12px'}}/>
		<HxLabel text={`[${label}]`} color="primary"/>
		<HxLabel text="Test Input:" style={{marginBottom: '-8px'}}/>
		<HxFormatInput $model={model} $field="value" pattern={pattern}
			// @ts-expect-error ignore the check
			           options={options}
			           autoComplete="off"/>
		<HxLabel text="Model Value:" style={{marginBottom: '-12px'}}/>
		<HxLabel $model={model} $field="displayValue" color="primary" $change={{
			on: 'value',
			handle: () => 'repaint'
		}}/>
	</div>;
};
