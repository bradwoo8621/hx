import type {HxDateTimeRelatedFormat, WithPartial} from '../../types';
import {amendPopupGapToEdge, amendPopupZIndex} from '../popup';
import type {HxDateFirstDayOfWeek} from './types';

/**
 * Global configuration settings for datetime-picker component
 */
export interface HxDateTimePickerSettings {
	/** Default value format, e.g. `y/m/d h:n:s` */
	valueFormat?: HxDateTimeRelatedFormat;
	/** Whether the value can be cleared */
	clearable?: boolean;
	/** First day of week: 0 = Sunday, 1 = Monday */
	firstDayOfWeek?: HxDateFirstDayOfWeek;
	/** force use Gregorian or not */
	forceGregorian?: boolean;
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
	/** i18n translation key for "Now" button */
	nowKey?: string;
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
export const HxDateTimePickerDefaults: WithPartial<Required<HxDateTimePickerSettings>, 'zIndex' | 'gapToEdge' | 'valueFormat'> = {
	firstDayOfWeek: 'sun',
	forceGregorian: true,
	clearable: false,
	enterToOpenPopup: false,
	spaceToOpenPopup: true,
	placeholder: true,
	placeholderKey: '~HxCommon.DateTimePickerPlaceholder',
	nowKey: '~HxCommon.NowButton',
	clearKey: '~HxCommon.ClearButton',
	monthKeyPrefix: '~HxCommon.Month',
	weekdayKeyPrefix: '~HxCommon.Weekday'
};

/**
 * Configure global datetime-picker component settings
 * @param settings - Configuration options to override defaults
 */
export const configHxDateTimePicker = (settings: HxDateTimePickerSettings) => {
	HxDateTimePickerDefaults.valueFormat = settings.valueFormat;
	HxDateTimePickerDefaults.clearable = settings.clearable ?? HxDateTimePickerDefaults.clearable;
	HxDateTimePickerDefaults.firstDayOfWeek = (settings.firstDayOfWeek?.trim() as HxDateFirstDayOfWeek) || HxDateTimePickerDefaults.firstDayOfWeek;
	if (!['sun', 'mon'].includes(HxDateTimePickerDefaults.firstDayOfWeek)) {
		HxDateTimePickerDefaults.firstDayOfWeek = 'sun';
	}
	HxDateTimePickerDefaults.forceGregorian = settings.forceGregorian ?? HxDateTimePickerDefaults.forceGregorian;
	HxDateTimePickerDefaults.enterToOpenPopup = settings.enterToOpenPopup ?? HxDateTimePickerDefaults.enterToOpenPopup;
	HxDateTimePickerDefaults.spaceToOpenPopup = settings.spaceToOpenPopup ?? HxDateTimePickerDefaults.spaceToOpenPopup;
	HxDateTimePickerDefaults.zIndex = amendPopupZIndex(settings.zIndex);
	HxDateTimePickerDefaults.gapToEdge = amendPopupGapToEdge(settings.gapToEdge);
	HxDateTimePickerDefaults.placeholder = settings.placeholder ?? HxDateTimePickerDefaults.placeholder;
	HxDateTimePickerDefaults.placeholderKey = settings.placeholderKey?.trim() || HxDateTimePickerDefaults.placeholderKey;
	HxDateTimePickerDefaults.nowKey = settings.nowKey?.trim() || HxDateTimePickerDefaults.nowKey;
	HxDateTimePickerDefaults.clearKey = settings.clearKey?.trim() || HxDateTimePickerDefaults.clearKey;
	HxDateTimePickerDefaults.monthKeyPrefix = settings.monthKeyPrefix?.trim() || HxDateTimePickerDefaults.monthKeyPrefix;
	HxDateTimePickerDefaults.weekdayKeyPrefix = settings.weekdayKeyPrefix?.trim() || HxDateTimePickerDefaults.weekdayKeyPrefix;
};
