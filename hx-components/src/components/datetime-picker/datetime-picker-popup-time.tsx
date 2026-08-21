import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ChangeEvent, useRef, useState} from 'react';
import {HxFormatInput} from '../format-input';
import {HxLabel} from '../label';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';

export interface HxDatetimePickerPopupTimeProps {
	stateRef: HxDateTimePickerStateRef;
}

type TimeField = 'hour' | 'minute' | 'second';

/** digit count of a full time field (hour/minute/second are all 2) */
const FIELD_WIDTH = 2;

/**
 * The time input row of the datetime picker popup: three integer inputs
 * (hour/minute/second) and two static colons, styled as one control.
 *
 * Values are bound to an internal `{hour, minute, second}` model seeded
 * from the state value; every accepted edit is forwarded to the model
 * via {@link HxDateTimePickerStateRef.changeTimeTo}. When a field
 * reaches its full width, focus auto-advances to the next field.
 *
 * The `onChange` callback reads the *corrected* value: the format kit
 * corrects synchronously in `beforeinput`, and React flushes
 * discrete-event state updates synchronously, so the DOM already holds
 * the corrected value when `onChange` fires. Rejected keystrokes (e.g.
 * `66` for minute) leave the value short and never advance.
 */
export const HxDatetimePickerPopupTime = (props: HxDatetimePickerPopupTimeProps) => {
	const {stateRef} = props;

	const [model] = useState(() => ERO.reactive({
		hour: stateRef.stateValue().hour,
		minute: stateRef.stateValue().minute,
		second: stateRef.stateValue().second
	}));
	const hourRef = useRef<HTMLInputElement>(null);
	const minuteRef = useRef<HTMLInputElement>(null);
	const secondRef = useRef<HTMLInputElement>(null);

	const onChangeField = (field: TimeField) => (ev: ChangeEvent<HTMLInputElement>) => {
		const {value} = ev.target;
		// commit to the model; an emptied field means 0
		const current = stateRef.stateValue();
		current[field] = Number(value);
		stateRef.changeTimeTo(current.hour, current.minute, current.second);

		// auto-advance to the next field when the current one is full
		// (second is the last field and has no next)
		if (!(ev.nativeEvent as InputEvent).isComposing && value.length === FIELD_WIDTH) {
			if (field === 'hour') {
				minuteRef.current?.focus();
			} else if (field === 'minute') {
				secondRef.current?.focus();
			}
		}
	};

	return <div data-hx-dtp-panel-time="">
		<span data-hx-dtp-panel-time-separator=""/>
		<HxFormatInput $model={model} $field="hour" pattern="@iu23z"
		               data-hx-dtp-panel-time-input="hour"
		               ref={hourRef} autoComplete="off"
		               onChange={onChangeField('hour')}/>
		<HxLabel data-hx-dtp-panel-time-colon="" text=":"/>
		<HxFormatInput $model={model} $field="minute" pattern="@iu59z"
		               data-hx-dtp-panel-time-input="minute"
		               ref={minuteRef} autoComplete="off"
		               onChange={onChangeField('minute')}/>
		<HxLabel data-hx-dtp-panel-time-colon="" text=":"/>
		<HxFormatInput $model={model} $field="second" pattern="@iu59z"
		               data-hx-dtp-panel-time-input="second"
		               ref={secondRef} autoComplete="off"
		               onChange={onChangeField('second')}/>
	</div>;
};
