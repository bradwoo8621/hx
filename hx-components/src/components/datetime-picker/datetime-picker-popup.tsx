import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type MutableRefObject, useRef} from 'react';
import {type HxLanguageCode, useHxContext} from '../../contexts';
import type {HxDateTimeValue, HxDateWeekendDay, HxParsedDateTimeFormat} from '../../types';
import {DateLocaleUtils, DateUtils, type HxFormattedWeekdays} from '../../utils';
import {ChevronLeft, ChevronRight, DoubleArrowLeft, DoubleArrowRight} from '../icons';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {HxDateTimePickerDefaults, redressFirstDayOfWeek, redressWeekendDays} from './defaults';
import {EvtHxDateTimePicker_ValueChange, type HxExtDateTimePickerProps} from './types';
import {parseModelValue} from './utils';

export type HxDateTimePickerPopupProps<T extends object> =
	& Pick<HxExtDateTimePickerProps<T>,
		'$model' | '$field'
		| 'firstDayOfWeek' | 'weekendDays' | 'forceGregorian' | 'nowKey' | 'clearKey'
	>
	& {
	/** Whether the popup is visible */
	visible: boolean;
	valueFormat: HxParsedDateTimeFormat;
	defaultValue: HxDateTimeValue;
	availableParts: Omit<HxParsedDateTimeFormat, 'sequence'>;
};

const getValue = <T extends object>(
	ref: MutableRefObject<Required<HxDateTimeValue> | undefined>,
	$model: HxDateTimePickerPopupProps<T>['$model'], $field: HxDateTimePickerPopupProps<T>['$field'],
	valueFormat: HxDateTimePickerPopupProps<T>['valueFormat'], defaultValue: HxDateTimePickerPopupProps<T>['defaultValue']
): Required<HxDateTimeValue> => {
	if (ref.current != null) {
		return ref.current;
	}

	const value = ERO.getValue($model, $field);
	let parsedValue: Required<HxDateTimeValue>;
	if (value == null || (typeof value === 'string' && value.trim().length === 0)) {
		parsedValue = DateUtils.fulfillWithDefault({}, defaultValue);
	} else {
		const parsed = parseModelValue(value, valueFormat);
		if (parsed === false) {
			parsedValue = DateUtils.fulfillWithDefault({}, defaultValue);
		} else {
			parsedValue = DateUtils.fulfillWithDefault(DateUtils.fromParsed(parsed), defaultValue);
		}
	}
	ref.current = parsedValue;
	return parsedValue;
};

const fixDayWhenOverLastDayOfMonth = (value: Required<HxDateTimeValue>) => {
	const {year, month, day} = value;
	if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
		// do nothing
	} else if ([4, 6, 9, 11].includes(month)) {
		if (day === 31) {
			value.day = 30;
		}
	} else if (year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)) {
		// Feb. leap year
		if (day > 29) {
			value.day = 29;
		}
	} else if (day > 28) {
		value.day = 28;
	}
};

interface ComputedWeek {
	week: Array<{
		key: HxDateWeekendDay;
		label: string;
		weekend: boolean;
	}>;
	weekendIndexes: Array<0 | 1 | 2 | 3 | 4 | 5 | 6>;
}

const standardWeekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const computeWeekdays = <T extends object>(
	weekdays: HxFormattedWeekdays, // sun - sat
	lang: HxLanguageCode,
	firstDayOfWeek?: HxDateTimePickerPopupProps<T>['firstDayOfWeek'],
	weekendDays?: HxDateTimePickerPopupProps<T>['weekendDays']
): ComputedWeek => {
	const mapped = weekdays.reduce((acc, weekday, index) => {
		const key = standardWeekDays[index] as HxDateWeekendDay;
		acc[key] = {label: weekday, weekend: false};
		return acc;
	}, {} as Record<HxDateWeekendDay, { label: string; weekend: boolean }>);

	let firstDayOfWeekOfLang: HxDateWeekendDay | undefined;
	let redressedWeekendDays = redressWeekendDays(weekendDays);
	if (redressedWeekendDays === 'default') {
		const {weekends, firstDayOfWeek} = DateLocaleUtils.getWeekInfo(lang);
		redressedWeekendDays = weekends;
		firstDayOfWeekOfLang = firstDayOfWeek;
	}
	// given
	redressedWeekendDays.forEach(key => {
		mapped[key].weekend = true;
	});

	let redressedFirstDayOfWeek = redressFirstDayOfWeek(firstDayOfWeek) as HxDateWeekendDay | 'default';
	if (redressedFirstDayOfWeek === 'default') {
		if (firstDayOfWeekOfLang != null) {
			redressedFirstDayOfWeek = firstDayOfWeekOfLang;
		} else {
			const {firstDayOfWeek} = DateLocaleUtils.getWeekInfo(lang);
			redressedFirstDayOfWeek = firstDayOfWeek;
		}
	}

	let indexes: Array<HxDateWeekendDay> = [];
	switch (redressedFirstDayOfWeek) {
		case 'mon': {
			indexes = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
			break;
		}
		case 'tue': {
			indexes = ['tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'mon'];
			break;
		}
		case 'wed': {
			indexes = ['wed', 'thu', 'fri', 'sat', 'sun', 'mon', 'tue'];
			break;
		}
		case 'thu': {
			indexes = ['thu', 'fri', 'sat', 'sun', 'mon', 'tue', 'wed'];
			break;
		}
		case 'fri': {
			indexes = ['fri', 'sat', 'sun', 'mon', 'tue', 'wed', 'thu'];
			break;
		}
		case 'sat': {
			indexes = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
			break;
		}
		case 'sun': {
			indexes = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
			break;
		}
	}
	return indexes.reduce((acc, key, index) => {
		const {label, weekend} = mapped[key];
		acc.week.push({key: key, label, weekend});
		if (weekend) {
			acc.weekendIndexes.push(index as ComputedWeek['weekendIndexes'][number]);
		}
		return acc;
	}, {week: [], weekendIndexes: []} as ComputedWeek);
};

const asJsDate = (value: Required<HxDateTimeValue>): Date => {
	return new Date(Date.UTC(value.year, value.month - 1, value.day, value.hour, value.minute, value.second));
};

export const HxDateTimePickerPopup =
	<T extends object>(props: HxDateTimePickerPopupProps<T>) => {
		const {
			visible,
			$model, $field,
			valueFormat, defaultValue,
			// availableParts,
			firstDayOfWeek, weekendDays,
			forceGregorian = HxDateTimePickerDefaults.forceGregorian
			// nowKey = HxDateTimePickerDefaults.nowKey, clearKey = HxDateTimePickerDefaults.clearKey
		} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		const containerRef = useRef<HTMLDivElement>(null);
		const currentValueRef = useRef<Required<HxDateTimeValue>>();

		// Don't render if popup is hidden
		if (!visible) {
			// eslint-disable-next-line react-hooks/refs
			delete currentValueRef.current;
			return null;
		}

		// eslint-disable-next-line react-hooks/refs
		const currentValue: Required<HxDateTimeValue> = getValue(currentValueRef, $model, $field, valueFormat, defaultValue);

		// const currentValue = currentValueRef.current.value;
		const onYearChange = (year: number) => {
			currentValue.year = year;
			fixDayWhenOverLastDayOfMonth(currentValue);
			popupContext.emit(EvtHxDateTimePicker_ValueChange, currentValue);
			context.forceUpdate();
		};
		const onPreviousYearClick = () => {
			onYearChange(currentValue.year - 1);
		};
		const onNextYearClick = () => {
			onYearChange(currentValue.year + 1);
		};
		const onYearClick = () => {
		};

		const onMonthChange = (month: number) => {
			if (month === 0) {
				// to December of previous year
				currentValue.year = currentValue.year - 1;
				currentValue.month = 12;
			} else if (month === 13) {
				// to January of next year
				currentValue.year = currentValue.year + 1;
				currentValue.month = 1;
			} else {
				currentValue.month = month;
			}
			fixDayWhenOverLastDayOfMonth(currentValue);
			popupContext.emit(EvtHxDateTimePicker_ValueChange, currentValue);
			context.forceUpdate();
		};
		const onPreviousMonthClick = () => {
			onMonthChange(currentValue.month - 1);
		};
		const onNextMonthClick = () => {
			onMonthChange(currentValue.month + 1);
		};
		const onMonthClick = () => {
		};

		const lang = context.language.current();
		const [, year, month, , weekdays] = DateLocaleUtils.formatDate(asJsDate(currentValue), lang, forceGregorian);
		const computedWeekdays = computeWeekdays(weekdays, lang, firstDayOfWeek, weekendDays);

		return <div data-hx-dtp-panel="" tabIndex={-1} ref={containerRef}>
			<div data-hx-dtp-panel-header="">
				<HxLabel clickable={true} data-hx-dtp-panel-btn="prev-year"
				         text={<DoubleArrowLeft/>} onClick={onPreviousYearClick}/>
				<HxLabel clickable={true} data-hx-dtp-panel-btn="prev-month"
				         text={<ChevronLeft/>} onClick={onPreviousMonthClick}/>
				<HxLabel indent={true} clickable={true} data-hx-dtp-panel-btn="month"
				         text={month} onClick={onMonthClick}/>
				<HxLabel indent={true} clickable={true} data-hx-dtp-panel-btn="year"
				         text={year} onClick={onYearClick}/>
				<HxLabel clickable={true} data-hx-dtp-panel-btn="next-month"
				         text={<ChevronRight/>} onClick={onNextMonthClick}/>
				<HxLabel clickable={true} data-hx-dtp-panel-btn="next-year"
				         text={<DoubleArrowRight/>} onClick={onNextYearClick}/>
			</div>
			<div data-hx-dtp-panel-days="">
				{computedWeekdays.week.map(weekday => {
					return <HxLabel data-hx-dtp-panel-weekday-label={weekday.key}
					                data-hx-dtp-panel-weekend={weekday.weekend ? '' : (void 0)}
					                text={weekday.label} key={weekday.key}/>;
				})}
			</div>
		</div>;
	};
