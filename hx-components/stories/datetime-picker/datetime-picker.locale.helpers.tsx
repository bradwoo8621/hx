import type {StoryObj} from '@storybook/react-vite';
import type {Dayjs} from 'dayjs';
// @ts-expect-error import React
import React, {type ReactNode} from 'react';
import {
	DateBuddhistUtils,
	DateChineseUtils,
	DateCopticUtils,
	DateEthiopicUtils,
	DateHebrewUtils,
	DateIndianUtils,
	DateIslamicCivilUtils,
	DateIslamicUmalquraUtils,
	DateIslamicUtils,
	DateJapaneseUtils,
	DateKoreanUtils,
	DateLocaleUtils,
	DateMinguoUtils,
	DatePersianUtils,
	DateUtils,
	HxDateTimePicker,
	type HxDateTimePickerDisplayFormatFunc,
	type HxDateTimePickerProps,
	HxFlex,
	HxLabel,
	type HxLanguageCode,
	UTCDate
} from '../../src';

// eslint-disable-next-line react-refresh/only-export-components
export const baseMeta = {
	component: HxDateTimePicker,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	},
	argTypes: {
		$model: {table: {disable: true}},
		$field: {table: {disable: true}},
		displayFormat: {
			control: 'text',
			description: 'hx pattern (@d/ymd), dayjs format string, or format function'
		},
		clearable: {control: 'boolean'},
		$disabled: {control: 'boolean'}
	},
	args: {
		valueFormat: 'y/m/d',
		$field: 'date',
		clearable: false
	}
};

DateChineseUtils.enable();
DateMinguoUtils.enable();
DateJapaneseUtils.enable();
DateKoreanUtils.enable();
DateBuddhistUtils.enable();
DateCopticUtils.enable();
DateEthiopicUtils.enable();
DateHebrewUtils.enable();
DateIndianUtils.enable();
DatePersianUtils.enable();
DateIslamicUtils.enable();
DateIslamicCivilUtils.enable();
DateIslamicUmalquraUtils.enable();

export type Story = StoryObj<typeof HxDateTimePicker>;

// eslint-disable-next-line react-refresh/only-export-components
export const isGregorian = (forceLang: HxLanguageCode | undefined): forceLang is undefined => {
	return forceLang == null || forceLang === 'gregory' || (forceLang.trim().length === 0);
};

export const LocaleStoryForDateOnly = <T extends object>(args: Omit<HxDateTimePickerProps<T>, 'displayFormat'> & {
	label: string; gCols?: number;
}) => {
	const lang = args.calendarLocale as HxLanguageCode | undefined;
	const gregorian = isGregorian(lang);
	const displayFormat: HxDateTimePickerDisplayFormatFunc = (value?: Dayjs): ReactNode | null | undefined => {
		if (value == null || !value.isValid()) {
			return '';
		} else if (gregorian) {
			const date = value.toDate();
			return [
				'Gregory',
				[
					`${date.getFullYear()}`.padStart(4, '0'),
					`${date.getMonth() + 1}`.padStart(2, '0'),
					`${date.getDate()}`.padStart(2, '0')
				].join('-')
			].join(' ');
		} else {
			const date = UTCDate.ofTimestamp(value.toDate().getTime());
			const [era, year, month, day] = DateLocaleUtils.formatDateInNumeric(date, lang!, gregorian);
			let yearForDisplay: string;
			if (DateCopticUtils.INSTANCE.accept(lang)) {
				yearForDisplay = String(year).padStart(4, '0');
			} else if (DateEthiopicUtils.INSTANCE.accept(lang)) {
				const value = DateUtils.asHxDate(date);
				if (DateEthiopicUtils.isBeforeIncarnation(value)) {
					yearForDisplay = 'B.I. ' + String(year).padStart(4, '0');
				} else {
					yearForDisplay = String(year).padStart(4, '0');
				}
			} else if (DateIndianUtils.INSTANCE.accept(lang)) {
				const value = DateUtils.asHxDate(date);
				if (DateIndianUtils.isBeforeSaka(value)) {
					yearForDisplay = String(year * -1).padStart(4, '0');
				} else {
					yearForDisplay = String(year).padStart(4, '0');
				}
			} else if (DatePersianUtils.INSTANCE.accept(lang)) {
				const value = DateUtils.asHxDate(date);
				if (DatePersianUtils.isBeforeHijraAndNotZero(value)) {
					yearForDisplay = String(year * -1).padStart(4, '0');
				} else {
					yearForDisplay = String(year).padStart(4, '0');
				}
				// Force LTR ordering: the RTL era label would otherwise flip the display order.
				// prepend LRM char
				yearForDisplay = String.fromCharCode(0x200E) + yearForDisplay;
			} else if (DateHebrewUtils.INSTANCE.accept(lang)) {
				yearForDisplay = String(year).padStart(4, '0');
			} else if (DateIslamicUtils.INSTANCE.accept(lang)) {
				const value = DateUtils.asHxDate(date);
				if (DateIslamicUtils.isBeforeHijra(value)) {
					yearForDisplay = String(year * -1).padStart(4, '0');
				} else {
					yearForDisplay = String(year).padStart(4, '0');
				}
				// Force LTR ordering: the RTL era label would otherwise flip the display order.
				// prepend LRM char
				yearForDisplay = String.fromCharCode(0x200E) + yearForDisplay;
			} else if (DateIslamicCivilUtils.INSTANCE.accept(lang)) {
				const value = DateUtils.asHxDate(date);
				if (DateIslamicCivilUtils.isBeforeHijra(value)) {
					yearForDisplay = String(year * -1).padStart(4, '0');
				} else {
					yearForDisplay = String(year).padStart(4, '0');
				}
				// Force LTR ordering: the RTL era label would otherwise flip the display order.
				// prepend LRM char
				yearForDisplay = String.fromCharCode(0x200E) + yearForDisplay;
			} else if (DateIslamicUmalquraUtils.INSTANCE.accept(lang)) {
				const value = DateUtils.asHxDate(date);
				if (DateIslamicUmalquraUtils.isBeforeHijra(value)) {
					yearForDisplay = String(year * -1).padStart(4, '0');
				} else {
					yearForDisplay = String(year).padStart(4, '0');
				}
				// Force LTR ordering: the RTL era label would otherwise flip the display order.
				// prepend LRM char
				yearForDisplay = String.fromCharCode(0x200E) + yearForDisplay;
			} else {
				yearForDisplay = `${era === '西暦' ? date.getFullYear() : year}`.padStart(4, '0');
			}

			return [
				[
					era,
					[
						yearForDisplay,
						`${month}`.padStart(2, '0'),
						`${day}`.padStart(2, '0')
					].join('-')
				].join(' '),
				[
					'(',
					[
						'Gregory',
						[
							`${date.getFullYear()}`.padStart(4, '0'),
							`${date.getMonthIndex() + 1}`.padStart(2, '0'),
							`${date.getDayOfMonth()}`.padStart(2, '0')
						].join('-')
					].join(' '),
					')'
				].join('')
			].join(' ');
		}
	};

	return <HxFlex direction="dir-y" gCols={args.gCols ?? 6}>
		<HxLabel text={args.label}/>
		<HxDateTimePicker {...args} displayFormat={displayFormat} availableParts="ymd"/>
	</HxFlex>;
};
