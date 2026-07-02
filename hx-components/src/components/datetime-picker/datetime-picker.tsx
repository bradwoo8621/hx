import {ERO} from '@hx/data';
import React, {
	type ForwardedRef,
	forwardRef,
	type ReactElement,
	type RefAttributes
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import type {HxDateTimeFormatDataChar, HxDateTimeFormatFixedChar, HxParsedDateTimeFormat} from '../../types';
import {DateUtils, I18NUtils} from '../../utils';
import {HxFormatInputDateTimePatternParser} from '../format-input/format-input-datetime-kit';
import {HxPopupProvider, type HxPopupProviderProps} from '../popup';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxDateTimePickerPanel} from './datetime-picker-panel';
import {HxCommonDefaults} from '../common/defaults';
import {HxDateTimePickerDefaults} from './defaults';
import {MonthC2Keys, WeekdayC2Keys} from '../../settings/i18n';
import {HxDateTimePickerInput, type HxDateTimePickerInputProps} from './datetime-picker-input';
import type {
	DateTimePickerMode,
	DateTimePickerSelection,
	HxDateTimePickerProps,
	HxDateTimePickerType
} from './types';

/** Build a display format structure from a parsed pattern (replicates the kit's transformFormat logic) */
const buildDisplayFormat = (parsed: {
	year?: number; month?: number; day?: number;
	hour?: number; minute?: number; second?: number;
	dateSeparator?: string; timeSeparator?: string; groupSeparator?: boolean;
}): HxParsedDateTimeFormat => {
	const parts: Array<[HxDateTimeFormatDataChar, number]> = ([
		['y', parsed.year ?? -1],
		['m', parsed.month ?? -1],
		['d', parsed.day ?? -1],
		['h', parsed.hour ?? -1],
		['n', parsed.minute ?? -1],
		['s', parsed.second ?? -1]
	] as Array<[HxDateTimeFormatDataChar, number]>)
		.filter(([, idx]) => idx !== -1)
		.sort(([, a], [, b]) => a - b);

	const dateSep = parsed.dateSeparator ?? '';
	const timeSep = parsed.timeSeparator ?? '';
	const groupSep = parsed.groupSeparator ? ' ' : '';

	const chars = parts.map(([ch]) => ch);
	const sequence: Array<HxDateTimeFormatDataChar | HxDateTimeFormatFixedChar> = [];
	for (let i = 0; i < chars.length; i++) {
		sequence.push(chars[i]);
		if (i < chars.length - 1) {
			const cur = chars[i];
			const next = chars[i + 1];
			if ('ymd'.includes(cur) && 'ymd'.includes(next) && dateSep) {
				sequence.push(dateSep);
			} else if ('hns'.includes(cur) && 'hns'.includes(next) && timeSep) {
				sequence.push(timeSep);
			} else if ('ymd'.includes(cur) && 'hns'.includes(next) && groupSep) {
				sequence.push(groupSep);
			} else if ('hns'.includes(cur) && 'ymd'.includes(next) && groupSep) {
				sequence.push(groupSep);
			}
		}
	}

	const hasYear = chars.includes('y');
	const hasMonth = chars.includes('m');
	const hasDay = chars.includes('d');
	const hasHour = chars.includes('h');
	const hasMinute = chars.includes('n');
	const hasSecond = chars.includes('s');

	return {
		hasYear, hasMonth, hasDay,
		hasDate: hasYear || hasMonth || hasDay,
		hasHour, hasMinute, hasSecond,
		hasTime: hasHour || hasMinute || hasSecond,
		sequence
	};
};

/** Convert a model value string to a partial selection (numbers) */
const modelValueToSelection = (value: string | null | undefined, valueFormat: Readonly<HxParsedDateTimeFormat>): Partial<DateTimePickerSelection> => {
	if (value == null || value === '') {
		return {};
	}
	const parsed = DateUtils.parseValue(value, valueFormat, {
		partialMatch: true, collectLegalTillNot: false
	});
	if (parsed === false) {
		return {};
	}
	const toNum = (s?: string): number | undefined => {
		if (s != null && s !== '') {
			const n = parseInt(s, 10);
			return isNaN(n) ? (void 0) : n;
		}
		return (void 0);
	};
	return {
		year: toNum(parsed.year),
		month: toNum(parsed.month),
		day: toNum(parsed.day),
		hour: toNum(parsed.hour) ?? 0,
		minute: toNum(parsed.minute) ?? 0,
		second: toNum(parsed.second) ?? 0
	};
};

/** Convert a selection to a model value string */
const selectionToModelValue = (selection: DateTimePickerSelection, valueFormat: Readonly<HxParsedDateTimeFormat>): string => {
	return DateUtils.formatValue({
		year: String(selection.year),
		month: String(selection.month),
		day: String(selection.day),
		hour: String(selection.hour),
		minute: String(selection.minute),
		second: String(selection.second)
	}, valueFormat);
};

/** Convert a min/max date value to a Date object */
const toDate = (value?: Date | string): Date | undefined => {
	if (value == null) {
		return (void 0);
	}
	if (value instanceof Date) {
		return value;
	}
	return new Date(value);
};

/**
 * Internal panel wrapper that bridges model state to the panel component.
 * Receives `visible` from the popup provider via interposeToChildren.
 */
const HxDateTimePickerPanelWrapper = <T extends object>(props: {
	$model: T;
	$field: string;
	displayFormat: Readonly<HxParsedDateTimeFormat>;
	valueFormat: Readonly<HxParsedDateTimeFormat>;
	showDate: boolean;
	showTime: boolean;
	firstDayOfWeek: 0 | 1;
	minDate?: Date;
	maxDate?: Date;
	todayKey?: React.ReactNode;
	clearKey?: React.ReactNode;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	visible?: any; // injected by popup provider
}) => {
	const {
		$model, $field,
		displayFormat, valueFormat,
		showDate, showTime, firstDayOfWeek,
		minDate, maxDate,
		todayKey, clearKey,
		visible
	} = props;

	const context = useHxContext();

	if (!visible) {
		return null;
	}

	const modelValue = ERO.getValue($model, $field) as string | null | undefined;
	const selected = modelValueToSelection(modelValue, valueFormat);

	const handleSelect = (sel: DateTimePickerSelection) => {
		const newValue = selectionToModelValue(sel, valueFormat);
		ERO.setValue($model, $field, newValue);
		context.forceUpdate();
	};

	const handleTimeChange = (h: number, m: number, s: number) => {
		// Update model value with new time, preserving existing date or using defaults
		const currentSelection = modelValueToSelection(ERO.getValue($model, $field) as string | null | undefined, valueFormat);
		const selection: DateTimePickerSelection = {
			year: currentSelection.year ?? new Date().getFullYear(),
			month: currentSelection.month ?? 1,
			day: currentSelection.day ?? 1,
			hour: h, minute: m, second: s
		};
		const newValue = selectionToModelValue(selection, valueFormat);
		ERO.setValue($model, $field, newValue);
		context.forceUpdate();
	};

	const handleToday = () => {
		const now = new Date();
		const selection: DateTimePickerSelection = {
			year: now.getFullYear(),
			month: now.getMonth() + 1,
			day: now.getDate(),
			hour: showTime ? now.getHours() : 0,
			minute: showTime ? now.getMinutes() : 0,
			second: showTime ? now.getSeconds() : 0
		};
		handleSelect(selection);
	};

	const handleClear = () => {
		ERO.setValue($model, $field, null);
		context.forceUpdate();
	};

	const handleClose = () => {
		// Close is handled by the input via popup events
	};

	const {weekdayKeyPrefix, monthKeyPrefix} = HxDateTimePickerDefaults;
	const weekdayNames = WeekdayC2Keys.map(suffix => {
		const [, key] = I18NUtils.isI18NKey(`${weekdayKeyPrefix}.${suffix}`);
		return String(context.language.get(key as string) ?? suffix);
	});
	const monthNames = MonthC2Keys.map(suffix => {
		if (suffix === '') {
			return '';
		}
		const [, key] = I18NUtils.isI18NKey(`${monthKeyPrefix}.${suffix}`);
		return String(context.language.get(key as string) ?? suffix);
	});

	return (
		<HxDateTimePickerPanel
			format={displayFormat}
			selected={selected}
			minDate={minDate}
			maxDate={maxDate}
			firstDayOfWeek={firstDayOfWeek}
			weekdayNames={weekdayNames}
			monthNames={monthNames}
			showTime={showTime}
			showDate={showDate}
			todayKey={todayKey}
			clearKey={clearKey}
			onSelect={handleSelect}
			onTimeChange={handleTimeChange}
			onToday={handleToday}
			onClear={handleClear}
			onClose={handleClose}
		/>
	);
};

/**
 * DateTime picker component with dropdown panel.
 *
 * Supports three modes based on the format pattern:
 * - `@d/ymd` → date only
 * - `@d:hns` → time only
 * - `@d/ymd :hns` → datetime
 *
 * Features:
 * - Month/year quick-select for fast navigation
 * - Date range restrictions (min/max)
 * - Calendar panel reusable for range picker composition
 * - Form model binding support
 *
 * @template T - Type of the form model object
 */
export const HxDateTimePicker =
	forwardRef(<T extends object>(props: HxDateTimePickerProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			format,
			minDate: rawMinDate, maxDate: rawMaxDate,
			firstDayOfWeek = HxDateTimePickerDefaults.firstDayOfWeek,
			enterToOpenPopup = HxDateTimePickerDefaults.enterToOpenPopup,
			spaceToOpenPopup = HxDateTimePickerDefaults.spaceToOpenPopup,
			clearable,
			placeholder = HxDateTimePickerDefaults.placeholder,
			placeholderKey = HxDateTimePickerDefaults.placeholderKey,
			calendarIcon,
			zIndex = HxDateTimePickerDefaults.zIndex,
			gapToEdge = HxDateTimePickerDefaults.gapToEdge,
			todayKey = HxDateTimePickerDefaults.todayKey,
			clearKey = HxDateTimePickerDefaults.clearKey,
			valueFormat: userValueFormat,
			...rest
		} = props;

		// Monitor reactive visibility and disabled state (must be before any conditional throw)
		const {visible, disabled} = useDataMonitor(props);

		// Parse the format pattern
		const parsed = HxFormatInputDateTimePatternParser.parse(format);
		if (parsed === false) {
			throw new Error(`Invalid datetime format pattern: ${format}`);
		}

		// Build display format from parsed pattern
		const displayFormat = buildDisplayFormat(parsed);

		// Determine mode and value format
		const mode: DateTimePickerMode = displayFormat.hasDate && displayFormat.hasTime
			? 'datetime'
			: displayFormat.hasDate ? 'date' : 'time';

		const valueFormatStr = userValueFormat ?? (
			mode === 'datetime' ? HxCommonDefaults.datetimeValueFormat
				: mode === 'date' ? HxCommonDefaults.dateValueFormat
					: HxCommonDefaults.timeValueFormat
		);
		const valueFormat = DateUtils.parseFormat(valueFormatStr);

		const minDate = toDate(rawMinDate);
		const maxDate = toDate(rawMaxDate);

		// Provider props for popup
		const providerProps: Omit<HxPopupProviderProps, 'trigger' | 'data' | 'children'> = {
			zIndex, gapToEdge, sameWidthAtMinimum: true
		};

		// Input props
		const inputProps: HxDateTimePickerInputProps<T> = {
			$model, $field,
			valueFormat, displayFormat,
			visible, disabled,
			clearable, enterToOpenPopup, spaceToOpenPopup,
			placeholder, placeholderKey, calendarIcon,
			zIndex, gapToEdge,
			...rest
		};

		return (
			<HxPopupProvider
				{...providerProps}
				data-hx-popup-for-datetime-picker=""
				// @ts-expect-error trigger type mismatch with generic
				trigger={<HxDateTimePickerInput {...inputProps} ref={ref}/>}>
				{/* visible is provided by popup provider via interposeToChildren */}
				<HxDateTimePickerPanelWrapper
					$model={$model} $field={$field}
					displayFormat={displayFormat}
					valueFormat={valueFormat}
					showDate={displayFormat.hasDate}
					showTime={displayFormat.hasTime}
					firstDayOfWeek={firstDayOfWeek}
					minDate={minDate} maxDate={maxDate}
					todayKey={todayKey} clearKey={clearKey}
				/>
			</HxPopupProvider>
		);
	}) as unknown as HxDateTimePickerType;
// @ts-expect-error assign component name
HxDateTimePicker.displayName = 'HxDateTimePicker';

/**
 * DateTime picker component with built-in form validation support
 */
export type HxWithCheckDateTimePickerType = <T extends object>(
	props: HxWithCheckProps<T, HxDateTimePickerProps<T>> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/**
 * DateTime picker wrapped with validation capabilities
 */
export const HxWithCheckDateTimePicker = HxWithCheck(HxDateTimePicker, HxWithCheckWithSingleFieldOptions) as unknown as HxWithCheckDateTimePickerType;
// @ts-expect-error assign component name
HxWithCheckDateTimePicker.displayName = 'HxWithCheckDateTimePicker';
