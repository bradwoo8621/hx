import type {HxDateTimeValue, HxDateWeekendDay, HxParsedDateTimeFormat} from '../../types';
import type {HxExtDateTimePickerProps} from './types';

export type HxDateTimePickerPopupProps<T extends object> =
	& Pick<HxExtDateTimePickerProps<T>,
		| '$model' | '$field'
		| 'firstDayOfWeek' | 'weekendDays' | 'forceLang'
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

export interface ComputedWeek {
	week: Array<{
		key: HxDateWeekendDay;
		label: string;
		weekend: boolean;
	}>;
	// follow JS Date's date value
	weekends: Array<0 | 1 | 2 | 3 | 4 | 5 | 6>;
}

export interface ComputedDay {
	key: string; // y-m-d in numbers
	label: string;
	weekend: boolean;
	value: Date;
	thisMonth: boolean;
}

export type ComputedDays = Array<ComputedDay>;

export interface HxDateTimeAnteroposteriorYearMonth {
	yearOfGregory: number;
	monthOfGregory: number;
	eraOfCalendar: string;
	yearOfCalendar: number;
	monthOfCalendar: number;
}

export type HxDateTimeAnteroposteriorYear =
	Omit<HxDateTimeAnteroposteriorYearMonth, 'monthOfGregory' | 'monthOfCalendar'>
	& {
	monthOfGregory: 1;
	monthOfCalendar: 1;
}

export interface HxDateTimeAnteroposterior {
	previousYear: HxDateTimeAnteroposteriorYear;
	previousMonth: HxDateTimeAnteroposteriorYearMonth;
	current: HxDateTimeAnteroposteriorYearMonth;
	nextMonth: HxDateTimeAnteroposteriorYearMonth;
	nextYear: HxDateTimeAnteroposteriorYear;
}
