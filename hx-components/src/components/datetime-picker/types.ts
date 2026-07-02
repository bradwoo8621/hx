import type {ReactElement, ReactNode, RefAttributes} from 'react';
import type {HxDateTimeRelatedFormat, HxParsedDateTimeFormat} from '../../types';
import type {
	HxEditSingleFieldProps,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxWidthConstrainedProps
} from '../../types';

/**
 * Extended datetime-picker component props
 * @template T - Type of the form model object
 */
export interface HxExtDateTimePickerProps<T extends object>
	extends HxEditSingleFieldProps<T>, HxWidthConstrainedProps {
	/** Pattern string defining the date/time format, e.g. `@d/ymd`, `@d:hns`, `@d/ymd :hns` */
	format: string;
	/** Minimum selectable date */
	minDate?: Date | string;
	/** Maximum selectable date */
	maxDate?: Date | string;
	/** First day of week: 0 = Sunday, 1 = Monday */
	firstDayOfWeek?: 0 | 1;
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
	/** i18n translation key or React node for "Today" button */
	todayKey?: ReactNode;
	/** i18n translation key or React node for "Clear" button */
	clearKey?: ReactNode;
	/** Value format for model binding (defaults to `y/m/d h:n:s` for datetime, `y/m/d` for date, `h:n:s` for time) */
	valueFormat?: HxDateTimeRelatedFormat;
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
	& HxHtmlElementProps<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>, OmittedDateTimePickerHTMLProps, T>;

/**
 * DateTime picker component type definition
 */
export type HxDateTimePickerType = <T extends object>(
	props: HxDateTimePickerProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

/** Event emitted when a date is selected in the panel */
export const EvtHxDateTimePicker_DateSelect = 'evt-hx-datetime-picker--date-select';
/** Event emitted when the time value changes */
export const EvtHxDateTimePicker_TimeChange = 'evt-hx-datetime-picker--time-change';
/** Event emitted when trying to close the panel */
export const EvtHxDateTimePicker_ClosePanel = 'evt-hx-datetime-picker--close-panel';
/** Event emitted when "Today" is clicked */
export const EvtHxDateTimePicker_Today = 'evt-hx-datetime-picker--today';
/** Event emitted when "Clear" is clicked */
export const EvtHxDateTimePicker_Clear = 'evt-hx-datetime-picker--clear';
/** Event emitted when trying to get the trigger DOM node */
export const EvtHxDateTimePicker_GetTrigger = 'evt-hx-datetime-picker--get-trigger';

/**
 * Represents a parsed date selection from the panel
 */
export interface DateTimePickerSelection {
	/** Year (full, e.g. 2024) */
	year: number;
	/** Month (1-12) */
	month: number;
	/** Day (1-31) */
	day: number;
	/** Hour (0-23) */
	hour: number;
	/** Minute (0-59) */
	minute: number;
	/** Second (0-59) */
	second: number;
}

/**
 * Mode derived from the format pattern
 */
export type DateTimePickerMode = 'datetime' | 'date' | 'time';

/**
 * Panel internal view mode
 */
export type PanelViewMode = 'calendar' | 'month-select' | 'year-select';

/**
 * Props for the calendar panel sub-component (exported for range picker reuse)
 */
export interface DateTimePickerPanelProps {
	/** The format definition parsed from the pattern */
	format: Readonly<HxParsedDateTimeFormat>;
	/** Currently selected date values */
	selected?: Partial<DateTimePickerSelection>;
	/** Minimum selectable date */
	minDate?: Date;
	/** Maximum selectable date */
	maxDate?: Date;
	/** First day of week */
	firstDayOfWeek: 0 | 1;
	/** Weekday name labels (0 = Sunday, 6 = Saturday) */
	weekdayNames: ReadonlyArray<string>;
	/** Month name labels (1 = January, 12 = December) */
	monthNames: ReadonlyArray<string>;
	/** Whether the time section is visible */
	showTime: boolean;
	/** Whether the date section is visible */
	showDate: boolean;
	/** i18n key for Today button */
	todayKey?: ReactNode;
	/** i18n key for Clear button */
	clearKey?: ReactNode;
	/** Called when a date is selected */
	onSelect: (selection: DateTimePickerSelection) => void;
	/** Called when time changes */
	onTimeChange: (hour: number, minute: number, second: number) => void;
	/** Called when Today is clicked */
	onToday: () => void;
	/** Called when Clear is clicked */
	onClear: () => void;
	/** Called when the panel should close */
	onClose: () => void;
}
