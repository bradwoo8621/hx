import type {Dayjs} from 'dayjs';
import type {HTMLAttributes, ReactElement, ReactNode, RefAttributes} from 'react';
import type {HxContext} from '../../contexts';
import type {
	HxDateFirstDayOfWeek,
	HxDateTimeRelatedFormat,
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxWidthConstrainedProps
} from '../../types';
import type {HxFormatInputDateTimePattern} from '../format-input';

export type HxDateTimePickerDisplayFormatFunc = (value?: Dayjs, context?: HxContext) => string;

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
	/** Pattern string defining the date/time format, e.g. `@d/ymd`, `@d:hns`, `@d/ymd :hns` */
	format: HxDateTimePickerDisplayFormat;
	/** Value format for model binding (defaults to `y/m/d h:n:s` for datetime, `y/m/d` for date, `h:n:s` for time) */
	valueFormat?: HxDateTimeRelatedFormat;
	/** First day of week */
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
