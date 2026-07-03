import type {Dayjs} from 'dayjs';
import type {HTMLAttributes, ReactElement, ReactNode, RefAttributes} from 'react';
import type {HxContext} from '../../contexts';
import type {
	HxDateFirstDayOfWeek,
	HxDateTimeRelatedFormat,
	HxDateTimeValue,
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxWidthConstrainedProps
} from '../../types';
import type {HxDateTimeDefaultValuesInStr, HxFormatInputDateTimePattern} from '../format-input';

export type HxDateTimePickerDisplayFormatFunc = (value?: Dayjs, context?: HxContext) => string | null | undefined;

export type HxDateTimePickerDisplayFormat =
	| HxFormatInputDateTimePattern
	| string // Dayjs format string (e.g. 'YYYY-MM-DD HH:mm:ss')
	| HxDateTimePickerDisplayFormatFunc;

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
	 * Default values for missing datetime parts.
	 * Used in two scenarios:
	 * - When the model value is `null`/`undefined`, the popup opens to this value.
	 * - When writing to the model, if {@link availableParts} does not fully cover the parts
	 *   required by {@link valueFormat}, these values fill the missing parts.
	 *
	 * Example: if `availableFields` is `ymd` and `valueFormat` is `y-m-dTh:n:s`,
	 * set `defaultValue` to `h23n59s59` to always write `23:59:59` for the time part.
	 * If omitted, defaults to current date for ymd and `0:0:0` for hns.
	 * Also accepts values like `y1980m1d1` so the popup opens at `1980/01/01` when the model is empty.
	 */
	defaultValue?: HxDateTimeDefaultValuesInStr | HxDateTimeValue;
	/** Value format for model binding (defaults to `y/m/d h:n:s` for datetime, `y/m/d` for date, `h:n:s` for time) */
	valueFormat?: HxDateTimeRelatedFormat;
	/** First day of week, works when date appeared (ymd all present) */
	firstDayOfWeek?: HxDateFirstDayOfWeek;
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
	nowKey?: ReactNode;
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

/** Event emitted when a date is selected in the panel */
export const EvtHxDateTimePicker_ValueChange = 'evt-hx-datetime-picker--value-change';
/** Event emitted when trying to close the panel */
export const EvtHxDateTimePicker_ClosePopup = 'evt-hx-datetime-picker--close-popup';
/** Event emitted when trying to get the picker DOM node */
export const EvtHxDateTimePicker_GetPicker = 'evt-hx-datetime-picker--get-picker';
