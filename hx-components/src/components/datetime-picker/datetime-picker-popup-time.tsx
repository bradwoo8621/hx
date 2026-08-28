import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ChangeEvent, type FocusEvent, type MouseEvent, type ReactNode, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {StringUtils} from '../../utils';
import {HxButton} from '../button';
import {HxFormatInput} from '../format-input';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {EvtHxDateTimePicker_HoverChange} from './types';

export interface HxDatetimePickerPopupTimeProps {
	stateRef: HxDateTimePickerStateRef;
	minute: boolean;
	second: boolean;
	startOfDayKey?: ReactNode;
	noonOfDayKey?: ReactNode;
	endOfDayKey?: ReactNode;
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
	const {stateRef, minute: hasMinute, second: hasSecond, startOfDayKey, noonOfDayKey, endOfDayKey} = props;

	const context = useHxContext();
	const popupContext = useHxPopupContext();
	const modelRef = useRef(ERO.reactive({
		hour: stateRef.stateValue().hour, minute: stateRef.stateValue().minute, second: stateRef.stateValue().second
	}));
	const hourRef = useRef<HTMLInputElement>(null);
	const minuteRef = useRef<HTMLInputElement>(null);
	const secondRef = useRef<HTMLInputElement>(null);
	const startOfDayRef = useRef<HTMLButtonElement>(null);

	const onChangeField = (field: TimeField) => (ev: ChangeEvent<HTMLInputElement>) => {
		const value = ev.target.value;
		// commit to the model; an emptied field means 0
		const current = stateRef.stateValue();
		current[field] = modelRef.current[field] ?? 0;
		stateRef.changeTimeTo(current.hour, current.minute, current.second, true);

		// auto-advance to the next field when the current one is full
		// (second is the last field and has no next)
		if (!(ev.nativeEvent as InputEvent).isComposing
			&& value.length === FIELD_WIDTH
			&& ev.target.selectionEnd === 2
			&& Number(value) === (modelRef.current[field] ?? 0)) {
			if (field === 'hour') {
				(minuteRef.current ?? secondRef.current ?? startOfDayRef.current)?.focus();
			} else if (field === 'minute') {
				(secondRef.current ?? startOfDayRef.current)?.focus();
			}
		}
	};
	const onBlurField = (field: TimeField) => (ev: ChangeEvent<HTMLInputElement>) => {
		if (StringUtils.isBlank(ev.target.value)) {
			const current = stateRef.stateValue();
			current[field] = 0;
			stateRef.changeTimeTo(current.hour, current.minute, current.second, true);
			ev.target.value = '00';
		}
	};

	const writeModel = (hour: number, minute?: number, second?: number) => {
		const model = modelRef.current;
		minute = minute ?? model.minute;
		second = second ?? model.second;
		stateRef.changeTimeTo(hour, minute, second, true);
		model.hour = hour;
		model.minute = minute;
		model.second = second;
		context.forceUpdate();
	};
	const onStartOfDayClick = () => writeModel(0, hasMinute ? 0 : (void 0), hasSecond ? 0 : (void 0));
	const onNoonOfDayClick = () => writeModel(12, hasMinute ? 0 : (void 0), hasSecond ? 0 : (void 0));
	const onEndOfDayClick = () => writeModel(23, hasMinute ? 59 : (void 0), hasSecond ? 59 : (void 0));
	const onAnyFocusOrMouseEnter = (ev: FocusEvent<HTMLSpanElement> | MouseEvent<HTMLSpanElement>) => {
		popupContext.emit(EvtHxDateTimePicker_HoverChange, ev.target);
	};

	return <div data-hx-dtp-panel-time="">
		<span data-hx-dtp-panel-time-separator=""/>
		{/* eslint-disable-next-line react-hooks/refs */}
		<HxFormatInput $model={modelRef.current} $field="hour" pattern="@iu23z"
		               data-hx-dtp-panel-time-input="hour"
		               ref={hourRef} autoComplete="off"
		               onChange={onChangeField('hour')}
		               onFocus={onAnyFocusOrMouseEnter}
		               onBlur={onBlurField('hour')}
		               onMouseEnter={onAnyFocusOrMouseEnter}/>
		{hasMinute
			? <>
				<HxLabel data-hx-dtp-panel-time-colon="" text=":"/>
				{/* eslint-disable-next-line react-hooks/refs */}
				<HxFormatInput $model={modelRef.current} $field="minute" pattern="@iu59z"
				               data-hx-dtp-panel-time-input="minute"
				               ref={minuteRef} autoComplete="off"
				               onChange={onChangeField('minute')}
				               onFocus={onAnyFocusOrMouseEnter}
				               onBlur={onBlurField('minute')}
				               onMouseEnter={onAnyFocusOrMouseEnter}/>
			</>
			: (void 0)}
		{hasSecond
			? <>
				<HxLabel data-hx-dtp-panel-time-colon="" text=":"/>
				{/* eslint-disable-next-line react-hooks/refs */}
				<HxFormatInput $model={modelRef.current} $field="second" pattern="@iu59z"
				               data-hx-dtp-panel-time-input="second"
				               ref={secondRef} autoComplete="off"
				               onChange={onChangeField('second')}
				               onFocus={onAnyFocusOrMouseEnter}
				               onBlur={onBlurField('second')}
				               onMouseEnter={onAnyFocusOrMouseEnter}/>
			</>
			: (void 0)}
		<HxButton variant="ghost" color="waive" tabIndex={-1} data-hx-padding-x="xs"
		          data-hx-dtp-panel-btn="start-of-day" text={startOfDayKey}
		          onClick={onStartOfDayClick} onMouseEnter={onAnyFocusOrMouseEnter} ref={startOfDayRef}/>
		<HxButton variant="ghost" color="waive" tabIndex={-1} data-hx-padding-x="xs"
		          data-hx-dtp-panel-btn="noon-of-day" text={noonOfDayKey}
		          onClick={onNoonOfDayClick} onMouseEnter={onAnyFocusOrMouseEnter}/>
		<HxButton variant="ghost" color="waive" tabIndex={-1} data-hx-padding-x="xs"
		          data-hx-dtp-panel-btn="end-of-day" text={endOfDayKey}
		          onClick={onEndOfDayClick} onMouseEnter={onAnyFocusOrMouseEnter}/>
	</div>;
};
