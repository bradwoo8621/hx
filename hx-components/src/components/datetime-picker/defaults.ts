import type {WithPartial} from '../../types';
import {amendPopupGapToEdge, amendPopupZIndex} from '../popup';

/**
 * Global configuration settings for datetime-picker component
 */
export interface HxDateTimePickerSettings {
	clearable?: boolean;
	/** First day of week: 0 = Sunday, 1 = Monday */
	firstDayOfWeek?: 0 | 1;
	/** Whether to open popup when Enter key is pressed */
	enterToOpenPopup?: boolean;
	/** Whether to open popup when Space key is pressed */
	spaceToOpenPopup?: boolean;
	/** Z-index base for datetime-picker popup layers */
	zIndex?: number;
	/** Minimum spacing between the popup edge and viewport boundary */
	gapToEdge?: number;
	/** i18n translation key for placeholder text when no value is selected */
	placeholderKey?: string;
	/** Whether to show placeholder text when no value is selected */
	placeholder?: boolean;
	/** i18n translation key for "Today" button */
	todayKey?: string;
	/** i18n translation key for "Clear" button */
	clearKey?: string;
	/** i18n key prefix for month names, e.g. `~HxCommon.Month` */
	monthKeyPrefix?: string;
	/** i18n key prefix for weekday names, e.g. `~HxCommon.Weekday` */
	weekdayKeyPrefix?: string;
}

/**
 * Default configuration values for datetime-picker component
 */
export const HxDateTimePickerDefaults: WithPartial<Required<HxDateTimePickerSettings>, 'zIndex' | 'gapToEdge'> = {
	clearable: false,
	firstDayOfWeek: 1,
	enterToOpenPopup: false,
	spaceToOpenPopup: true,
	placeholder: true,
	placeholderKey: '~HxCommon.DateTimePickerPlaceholder',
	todayKey: '~HxCommon.DateTimePickerToday',
	clearKey: '~HxCommon.DateTimePickerClear',
	monthKeyPrefix: '~HxCommon.Month',
	weekdayKeyPrefix: '~HxCommon.Weekday'
};

/**
 * Configure global datetime-picker component settings
 * @param settings - Configuration options to override defaults
 */
export const configHxDateTimePicker = (settings: HxDateTimePickerSettings) => {
	HxDateTimePickerDefaults.clearable = settings.clearable ?? HxDateTimePickerDefaults.clearable;
	HxDateTimePickerDefaults.firstDayOfWeek = settings.firstDayOfWeek ?? HxDateTimePickerDefaults.firstDayOfWeek;
	HxDateTimePickerDefaults.enterToOpenPopup = settings.enterToOpenPopup ?? HxDateTimePickerDefaults.enterToOpenPopup;
	HxDateTimePickerDefaults.spaceToOpenPopup = settings.spaceToOpenPopup ?? HxDateTimePickerDefaults.spaceToOpenPopup;
	HxDateTimePickerDefaults.zIndex = amendPopupZIndex(settings.zIndex);
	HxDateTimePickerDefaults.gapToEdge = amendPopupGapToEdge(settings.gapToEdge);
	HxDateTimePickerDefaults.placeholder = settings.placeholder ?? HxDateTimePickerDefaults.placeholder;
	HxDateTimePickerDefaults.placeholderKey = settings.placeholderKey?.trim() || HxDateTimePickerDefaults.placeholderKey;
	HxDateTimePickerDefaults.todayKey = settings.todayKey?.trim() || HxDateTimePickerDefaults.todayKey;
	HxDateTimePickerDefaults.clearKey = settings.clearKey?.trim() || HxDateTimePickerDefaults.clearKey;
	HxDateTimePickerDefaults.monthKeyPrefix = settings.monthKeyPrefix?.trim() || HxDateTimePickerDefaults.monthKeyPrefix;
	HxDateTimePickerDefaults.weekdayKeyPrefix = settings.weekdayKeyPrefix?.trim() || HxDateTimePickerDefaults.weekdayKeyPrefix;
};
