import type {Dayjs} from 'dayjs';
import type {HTMLAttributes, ReactElement, ReactNode, RefAttributes} from 'react';
import type {HxContext, HxLanguageCode} from '../../contexts';
import type {
	HxDateTimeDefaultValuesInStr,
	HxDateTimeRelatedFormat,
	HxDateTimeValue,
	HxDateWeekendDay,
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxWidthConstrainedProps
} from '../../types';
import type {HxFormatInputDateTimePattern} from '../format-input';

export type HxDateTimePickerDisplayFormatFunc = (value?: Dayjs, context?: HxContext) => ReactNode | null | undefined;

export type HxDateTimePickerDisplayFormat =
	| HxFormatInputDateTimePattern
	| string // Dayjs format string (e.g. 'YYYY-MM-DD HH:mm:ss')
	| HxDateTimePickerDisplayFormatFunc;

/** sun -> Sunday, mon -> Monday, default -> follow locale */
export type HxDateFirstDayOfWeek = 'sun' | 'mon' | 'default';
export type HxDateWeekendDays = Array<HxDateWeekendDay> | 'default';

/**
 * Extended datetime-picker component props
 * @template T - Type of the form model object
 */
export interface HxExtDateTimePickerProps<T extends object>
	extends HxEditSingleFieldProps<T>, HxWidthConstrainedProps {
	/**
	 * Pattern string defining the date/time format, could be one of following:
	 * - hx display format: e.g. `@d/ymd`, `@d:hns`, `@d/ymd :hns`,
	 * - dayjs format,
	 * - format function.
	 */
	displayFormat: HxDateTimePickerDisplayFormat;
	/**
	 * Available datetime fields for this picker.
	 * - If {@link displayFormat} uses {@link HxFormatInputDateTimePattern}, this is auto-detected and ignored even declared.
	 * - If {@link displayFormat} uses a dayjs format string, it is auto-detected only when not explicitly set.
	 *   Detection is limited to https://day.js.org/docs/en/display/format and does not cover advanced or extended formats.
	 * - If {@link displayFormat} is a function, this field is required.
	 */
	availableParts?: HxDateTimeRelatedFormat;
	/**
	 * Default value for missing datetime parts.
	 * Used in two scenarios:
	 * - When the model value is `null`/`undefined`, the popup opens to this value.
	 * - When writing to the model, if {@link availableParts} does not fully cover the parts
	 *   required by {@link valueFormat}, these value fill the missing parts.
	 *
	 * Example: if `availableFields` is `ymd` and `valueFormat` is `y-m-dTh:n:s`,
	 * set `defaultValue` to `h23n59s59` to always write `23:59:59` for the time part.
	 * If omitted, defaults to current date for ymd and `0:0:0` for hns.
	 * Also accepts value like `y1980m1d1` so the popup opens at `1980/01/01` when the model is empty.
	 */
	defaultValue?: HxDateTimeDefaultValuesInStr | HxDateTimeValue;
	/** Value format for model binding (defaults to `y/m/d h:n:s` for datetime, `y/m/d` for date, `h:n:s` for time) */
	valueFormat?: HxDateTimeRelatedFormat;
	/** First day of week, works when date appeared (ymd all present) */
	firstDayOfWeek?: HxDateFirstDayOfWeek;
	/** weekend days, works when date appeared (ymd all present) */
	weekendDays?: HxDateWeekendDays;
	/** force use Gregorian or not */
	forceLang?: 'gregory' | HxLanguageCode;
	/** Whether to open popup when Enter key is pressed */
	enterToOpenPopup?: boolean;
	/** Whether to open popup when Space key is pressed */
	spaceToOpenPopup?: boolean;
	/** Whether the value is clearable */
	clearable?: boolean;
	/** Whether to show placeholder text when no value is selected */
	placeholder?: boolean;
	/** i18n translation key or React node for placeholder text */
	placeholderKey?: ReactNode;
	/** Custom calendar icon */
	calendarIcon?: ReactNode;
	/** Z-index for the popup layer */
	zIndex?: number;
	/** Minimum gap between popup edge and viewport boundary */
	gapToEdge?: number;
	/** i18n translation key or React node for "Now" button */
	todayKey?: ReactNode;
	/** i18n translation key or React node for "Clear" button */
	clearKey?: ReactNode;
}

/**
 * HTML props that are omitted from datetime-picker component props
 */
export type OmittedDateTimePickerHTMLProps =
	| HxOmittedAttributes
	| 'children';

/**
 * Full datetime-picker component props including HTML attributes
 * @template T - Type of the form model object
 */
export type HxDateTimePickerProps<T extends object> =
	& HxExtDateTimePickerProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedDateTimePickerHTMLProps, T>;

/**
 * DateTime picker component type definition
 */
export type HxDateTimePickerType = <T extends object>(
	props: HxDateTimePickerProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/** Event emitted when a value is selected in the panel */
export const EvtHxDateTimePicker_ValueChange = 'evt-hx-datetime-picker--value-change';
/** Event emitted when value is cleared in the panel */
export const EvtHxDateTimePicker_ValueClear = 'evt-hx-datetime-picker--value-clear';
/** Event emitted when trying to close the panel */
export const EvtHxDateTimePicker_ClosePopup = 'evt-hx-datetime-picker--close-popup';
/** Event emitted when trying to get the picker DOM node */
export const EvtHxDateTimePicker_GetPicker = 'evt-hx-datetime-picker--get-picker';
/** Event emitted when arrow key down */
export const EvtHxDateTimePicker_ArrowKey = 'evt-hx-datetime-picker--arrow-key';
