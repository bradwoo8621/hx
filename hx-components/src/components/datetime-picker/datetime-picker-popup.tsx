import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type MutableRefObject, useRef} from 'react';
import {type HxLanguageCode, useHxContext} from '../../contexts';
import type {HxDateTimeValue, HxDateWeekendDay, HxParsedDateTimeFormat} from '../../types';
import {DateLocaleUtils, DateUtils, type HxFormattedWeekdays} from '../../utils';
import {HxButton} from '../button';
import {ChevronLeft, ChevronRight, DoubleArrowLeft, DoubleArrowRight} from '../icons';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {HxDateTimePickerDefaults, redressFirstDayOfWeek, redressWeekendDays} from './defaults';
import {EvtHxDateTimePicker_ValueChange, EvtHxDateTimePicker_ValueClear, type HxExtDateTimePickerProps} from './types';
import {parseModelValue} from './utils';

export type HxDateTimePickerPopupProps<T extends object> =
	& Pick<HxExtDateTimePickerProps<T>,
		'$model' | '$field'
		| 'firstDayOfWeek' | 'weekendDays' | 'forceGregorian'
		| 'todayKey' | 'clearKey'
	>
	& {
	/** Whether the popup is visible */
	visible: boolean;
	valueFormat: HxParsedDateTimeFormat;
	defaultValue: HxDateTimeValue;
	availableParts: Omit<HxParsedDateTimeFormat, 'sequence'>;
	clearable: boolean;
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
	// follow JS Date's date value
	weekends: Array<0 | 1 | 2 | 3 | 4 | 5 | 6>;
}

const WeekdaysOfSun: Array<HxDateWeekendDay> = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const WeekdaysOfMon: Array<HxDateWeekendDay> = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const WeekdaysOfTue: Array<HxDateWeekendDay> = ['tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'mon'] as const;
const WeekdaysOfWed: Array<HxDateWeekendDay> = ['wed', 'thu', 'fri', 'sat', 'sun', 'mon', 'tue'] as const;
const WeekdaysOfThu: Array<HxDateWeekendDay> = ['thu', 'fri', 'sat', 'sun', 'mon', 'tue', 'wed'] as const;
const WeekdaysOfFri: Array<HxDateWeekendDay> = ['fri', 'sat', 'sun', 'mon', 'tue', 'wed', 'thu'] as const;
const WeekdaysOfSat: Array<HxDateWeekendDay> = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] as const;
const AllWeekdays = {
	sun: WeekdaysOfSun,
	mon: WeekdaysOfMon,
	tue: WeekdaysOfTue,
	wed: WeekdaysOfWed,
	thu: WeekdaysOfThu,
	fri: WeekdaysOfFri,
	sat: WeekdaysOfSat
} as const;
const AllWeekdaysToDateStd: Record<HxDateWeekendDay, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
	sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
};

const computeWeekdays = <T extends object>(
	weekdays: HxFormattedWeekdays, // sun - sat
	lang: HxLanguageCode,
	firstDayOfWeek?: HxDateTimePickerPopupProps<T>['firstDayOfWeek'],
	weekendDays?: HxDateTimePickerPopupProps<T>['weekendDays']
): ComputedWeek => {
	const computed: ComputedWeek = {week: [], weekends: []};

	const mapped = weekdays.reduce((acc, weekday, index) => {
		const key = WeekdaysOfSun[index] as HxDateWeekendDay;
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
		computed.weekends.push(WeekdaysOfSun.indexOf(key) as ComputedWeek['weekends'][number]);
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

	AllWeekdays[redressedFirstDayOfWeek].forEach(key => {
		const {label, weekend} = mapped[key];
		computed.week.push({key: key, label, weekend});
	});
	return computed;
};

interface ComputedDay {
	key: string; // y-m-d in numbers
	label: string;
	weekend: boolean;
	value: Date;
	thisMonth: boolean;
}

type ComputedDays = Array<ComputedDay>;

const computeLeadingPaddingDays = (date: Date, firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
	return (date.getDay() - firstDayOfWeek + 7) % 7;
};
const computeTrailingPaddingDays = (date: Date, firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
	return 6 - (date.getDay() - firstDayOfWeek + 7) % 7;
};
// compute 42 days for selection
const computeDays = (date: Date, lang: HxLanguageCode, forceGregorian: boolean, week: ComputedWeek): ComputedDays => {
	const daysOfThisMonth: Array<Date> = [];
	const daysBeforeThisMonth: Array<Date> = [];
	const daysAfterThisMonth: Array<Date> = [];
	if (forceGregorian) {
		// quick computation
		daysOfThisMonth.push(...new Array(DateUtils.lastDayOfMonth(date.getFullYear(), date.getMonth() + 1))
			.fill(1)
			.map((_, index) => {
				const d = new Date(date);
				d.setDate(index + 1);
				return d;
			}));
		const firstDayOfWeek = AllWeekdaysToDateStd[week.week[0].key];
		let leadingPaddingDays: number;
		let trailingPaddingDays: number;
		const firstDayOfMonth = daysOfThisMonth[0];
		const lastDayOfMonth = daysOfThisMonth[daysOfThisMonth.length - 1];
		if (daysOfThisMonth.length === 28 && firstDayOfMonth.getDay() === firstDayOfWeek) {
			leadingPaddingDays = 7;
			trailingPaddingDays = 7;
		} else {
			leadingPaddingDays = computeLeadingPaddingDays(firstDayOfMonth, firstDayOfWeek);
			trailingPaddingDays = computeTrailingPaddingDays(lastDayOfMonth, firstDayOfWeek);
		}
		for (let index = 1; index <= leadingPaddingDays; index++) {
			const date = new Date(firstDayOfMonth);
			date.setDate(firstDayOfMonth.getDate() - index);
			daysBeforeThisMonth.unshift(date);
		}
		for (let index = 1; index <= trailingPaddingDays; index++) {
			const date = new Date(lastDayOfMonth);
			date.setDate(lastDayOfMonth.getDate() + index);
			daysAfterThisMonth.push(date);
		}
		const days = [...daysBeforeThisMonth, ...daysOfThisMonth, ...daysAfterThisMonth];
		if (days.length === 35) {
			if (daysBeforeThisMonth.length === 0) {
				const firstDay = days[0];
				for (let index = 1; index <= 7; index++) {
					const date = new Date(firstDay);
					date.setDate(firstDay.getDate() - index);
					days.unshift(date);
				}
			} else {
				const lastDay = days[days.length - 1];
				for (let index = 1; index <= 7; index++) {
					const date = new Date(lastDay);
					date.setDate(lastDay.getDate() + index);
					days.push(date);
				}
			}
		}

		const thisMonth = date.getMonth();
		return days.map(day => {
			return {
				key: `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`,
				label: DateLocaleUtils.formatDay(day, lang, forceGregorian),
				weekend: week.weekends.includes(day.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6),
				value: day,
				thisMonth: day.getMonth() === thisMonth
			};
		});
	} else {
		// TODO
		return [];
	}
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
			forceGregorian = HxDateTimePickerDefaults.forceGregorian,
			clearable,
			todayKey = HxDateTimePickerDefaults.todayKey,
			clearKey = HxDateTimePickerDefaults.clearKey
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
			// TODO show year panel
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
			// TODO show month panel
		};
		const onDayClick = (date: Date) => () => {
			currentValue.year = date.getFullYear();
			currentValue.month = date.getMonth() + 1;
			currentValue.day = date.getDate();
			popupContext.emit(EvtHxDateTimePicker_ValueChange, currentValue);
			context.forceUpdate();
		};
		const onTodayClick = () => {
			const date = new Date();
			currentValue.year = date.getFullYear();
			currentValue.month = date.getMonth() + 1;
			currentValue.day = date.getDate();
			popupContext.emit(EvtHxDateTimePicker_ValueChange, currentValue);
			context.forceUpdate();
		};
		const onClearClick = () => {
			popupContext.emit(EvtHxDateTimePicker_ValueClear, currentValue);
		};

		const lang = context.language.current();
		const date = asJsDate(currentValue);
		const [, year, month, , weekdays] = DateLocaleUtils.formatDate(date, lang, forceGregorian);
		const computedWeekdays = computeWeekdays(weekdays, lang, firstDayOfWeek, weekendDays);
		const computedDays = computeDays(date, lang, forceGregorian, computedWeekdays);

		return <div data-hx-dtp-panel="" tabIndex={-1} ref={containerRef}>
			<div data-hx-dtp-panel-header="">
				<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="prev-year"
				          text={<DoubleArrowLeft/>} onClick={onPreviousYearClick}/>
				<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="prev-month"
				          text={<ChevronLeft/>} onClick={onPreviousMonthClick}/>
				<HxLabel indent={true} clickable={true} data-hx-dtp-panel-btn="month"
				         text={month} onClick={onMonthClick}/>
				<HxLabel indent={true} clickable={true} data-hx-dtp-panel-btn="year"
				         text={year} onClick={onYearClick}/>
				<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="next-month"
				          text={<ChevronRight/>} onClick={onNextMonthClick}/>
				<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="next-year"
				          text={<DoubleArrowRight/>} onClick={onNextYearClick}/>
			</div>
			<div data-hx-dtp-panel-days="">
				{computedWeekdays.week.map(weekday => {
					return <HxLabel data-hx-dtp-panel-weekday-label={weekday.key}
					                data-hx-dtp-panel-weekend={weekday.weekend ? '' : (void 0)}
					                text={weekday.label} key={weekday.key}/>;
				})}
				<span data-hx-dtp-panel-days-header-separator=""/>
				{computedDays.map(day => {
					const isCurrent = day.value.getFullYear() === currentValue.year
						&& (day.value.getMonth() + 1) === currentValue.month
						&& day.value.getDate() === currentValue.day;
					return <HxLabel data-hx-dtp-panel-day-label={day.key}
					                data-hx-dtp-panel-weekend={day.weekend ? '' : (void 0)}
					                data-hx-dtp-panel-this-month={day.thisMonth ? '' : (void 0)}
					                data-hx-dtp-panel-current-value={isCurrent ? '' : (void 0)}
					                hoverable={true}
					                text={day.label} key={day.key}
					                onClick={onDayClick(day.value)}/>;
				})}
				<span data-hx-dtp-panel-days-header-separator=""/>
			</div>
			<div data-hx-dtp-panel-footer="">
				<HxButton variant="ghost" color="primary" tabIndex={-1} data-hx-dtp-panel-btn="today" text={todayKey}
				          onClick={onTodayClick}/>
				{clearable
					? <HxButton variant="ghost" color="danger" tabIndex={-1}
					            data-hx-dtp-panel-btn="clear" text={clearKey}
					            onClick={onClearClick}/>
					: (void 0)}
			</div>
		</div>;
	};
