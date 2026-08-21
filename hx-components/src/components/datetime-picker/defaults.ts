import type {ReactNode} from 'react';
import type {HxDateTimeRelatedFormat, WithPartial} from '../../types';
import {amendPopupGapToEdge, amendPopupZIndex} from '../popup';
import type {HxDateFirstDayOfWeek, HxDateTimePickerValueSyncMode, HxDateWeekendDays} from './types';

/**
 * Global configuration settings for datetime-picker component
 */
export interface HxDateTimePickerSettings {
	/** Default value format, e.g. `y/m/d h:n:s` */
	valueFormat?: HxDateTimeRelatedFormat;
	/** Whether the value can be cleared */
	clearable?: boolean;
	/** First day of week */
	firstDayOfWeek?: HxDateFirstDayOfWeek;
	/** weekend days */
	weekendDays?: HxDateWeekendDays;
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
	/** i18n translation key or React node for "Start Of Day" button */
	startOfDayKey?: ReactNode;
	/** i18n translation key or React node for "Noon Of Day" button */
	noonOfDayKey?: ReactNode;
	/** i18n translation key or React node for "End Of Day" button */
	endOfDayKey?: ReactNode;
	/** i18n translation key for "Now" button */
	todayKey?: string;
	/** i18n translation key for "Clear" button */
	clearKey?: string;
	/** i18n translation key for "Confirm" button */
	confirmKey?: string;
	/** Value change will be synchronized to model immediately or not, default not */
	valueSyncMode?: HxDateTimePickerValueSyncMode;
}

/**
 * Default configuration values for datetime-picker component
 */
export const HxDateTimePickerDefaults: WithPartial<Required<HxDateTimePickerSettings>, 'zIndex' | 'gapToEdge' | 'valueFormat'> = {
	firstDayOfWeek: 'default',
	weekendDays: 'default',
	forceGregorian: true,
	clearable: false,
	enterToOpenPopup: false,
	spaceToOpenPopup: true,
	placeholder: true,
	placeholderKey: '~HxCommon.DateTimePickerPlaceholder',
	startOfDayKey: '~HxCommon.StartOfDayButton',
	noonOfDayKey: '~HxCommon.NoonOfDayButton',
	endOfDayKey: '~HxCommon.EndOfDayButton',
	todayKey: '~HxCommon.TodayButton',
	clearKey: '~HxCommon.ClearButton',
	confirmKey: '~HxCommon.OkButton',
	valueSyncMode: 'default'
};

/**
 * Configure global datetime-picker component settings
 * @param settings - Configuration options to override defaults
 */
export const configHxDateTimePicker = (settings: HxDateTimePickerSettings) => {
	HxDateTimePickerDefaults.valueFormat = settings.valueFormat ?? HxDateTimePickerDefaults.valueFormat;
	HxDateTimePickerDefaults.clearable = settings.clearable ?? HxDateTimePickerDefaults.clearable;
	HxDateTimePickerDefaults.firstDayOfWeek = redressFirstDayOfWeek(settings.firstDayOfWeek);
	HxDateTimePickerDefaults.weekendDays = redressWeekendDays(settings.weekendDays);
	HxDateTimePickerDefaults.forceGregorian = settings.forceGregorian ?? HxDateTimePickerDefaults.forceGregorian;
	HxDateTimePickerDefaults.enterToOpenPopup = settings.enterToOpenPopup ?? HxDateTimePickerDefaults.enterToOpenPopup;
	HxDateTimePickerDefaults.spaceToOpenPopup = settings.spaceToOpenPopup ?? HxDateTimePickerDefaults.spaceToOpenPopup;
	HxDateTimePickerDefaults.zIndex = amendPopupZIndex(settings.zIndex);
	HxDateTimePickerDefaults.gapToEdge = amendPopupGapToEdge(settings.gapToEdge);
	HxDateTimePickerDefaults.placeholder = settings.placeholder ?? HxDateTimePickerDefaults.placeholder;
	HxDateTimePickerDefaults.placeholderKey = settings.placeholderKey?.trim() || HxDateTimePickerDefaults.placeholderKey;
	HxDateTimePickerDefaults.todayKey = settings.todayKey?.trim() || HxDateTimePickerDefaults.todayKey;
	HxDateTimePickerDefaults.clearKey = settings.clearKey?.trim() || HxDateTimePickerDefaults.clearKey;
	HxDateTimePickerDefaults.valueSyncMode = (settings.valueSyncMode?.trim() as HxDateTimePickerValueSyncMode) ?? HxDateTimePickerDefaults.valueSyncMode;
};

export const redressFirstDayOfWeek = (firstDayOfWeek?: HxDateFirstDayOfWeek): HxDateFirstDayOfWeek => {
	if (firstDayOfWeek == null) {
		return HxDateTimePickerDefaults.firstDayOfWeek;
	} else if (!['sun', 'mon', 'default'].includes(firstDayOfWeek)) {
		return HxDateTimePickerDefaults.firstDayOfWeek;
	} else {
		return firstDayOfWeek;
	}
};

export const redressWeekendDays = (weekendDays?: HxDateWeekendDays): HxDateWeekendDays => {
	if (weekendDays == null) {
		return HxDateTimePickerDefaults.weekendDays;
	} else if (Array.isArray(weekendDays)) {
		const values = weekendDays.filter(d => ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(d));
		if (values.length > 0) {
			return values;
		} else {
			return HxDateTimePickerDefaults.weekendDays;
		}
	} else if ('default' !== HxDateTimePickerDefaults.weekendDays) {
		return HxDateTimePickerDefaults.weekendDays;
	} else {
		return 'default';
	}
};