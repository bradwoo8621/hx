import type {HxDateTimeValue, HxParsedDateTimeFormat} from '../../types';
import type {HxExtDateTimePickerProps} from './types';

export type HxDateTimePickerPopupProps<T extends object> =
	& Pick<HxExtDateTimePickerProps<T>,
		| '$model' | '$field'
		| 'firstDayOfWeek' | 'weekendDays' | 'calendarLocale'
		| 'todayKey' | 'clearKey' | 'confirmKey'
	>
	& {
	/** Whether the popup is visible */
	visible: boolean;
	valueFormat: HxParsedDateTimeFormat;
	defaultValue: HxDateTimeValue;
	availableParts: Omit<HxParsedDateTimeFormat, 'sequence'>;
	clearable: boolean;
};
