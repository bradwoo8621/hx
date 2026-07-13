import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {HxDateTimePicker} from '../src';

const meta: Meta<typeof HxDateTimePicker> = {
	title: 'Components/Basic/DateTimePicker',
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
	}
};

export default meta;
type Story = StoryObj<typeof HxDateTimePicker>;

/** Date picker with hx pattern. */
export const DatePicker: Story = {
	args: {
		$model: ERO.reactive({date: '2024/06/10'}),
		$field: 'date',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d',
		clearable: true
	}
};

/** Date time picker with both date and time parts. */
export const DateTimePicker: Story = {
	args: {
		$model: ERO.reactive({datetime: '2024/06/10 14:30:00'}),
		$field: 'datetime',
		displayFormat: '@d/ymd :hns',
		valueFormat: 'y/m/d h:n:s',
		clearable: true
	}
};

/** Time picker only. */
export const TimePicker: Story = {
	args: {
		$model: ERO.reactive({time: '14:30:00'}),
		$field: 'time',
		displayFormat: '@d:hns',
		valueFormat: 'h:n:s',
		clearable: true
	}
};

/** Date picker with dayjs format string. */
export const DayjsFormat: Story = {
	args: {
		$model: ERO.reactive({date: '2024-06-10'}),
		$field: 'date',
		displayFormat: 'YYYY-MM-DD',
		valueFormat: 'y-m-d',
		clearable: true
	}
};

/** Date picker with dash separator. */
export const DateDash: Story = {
	args: {
		$model: ERO.reactive({date: '2024-06-10'}),
		$field: 'date',
		displayFormat: '@d-ymd',
		valueFormat: 'y-m-d',
		clearable: true
	}
};

/** Disabled date picker. */
export const Disabled: Story = {
	args: {
		$model: ERO.reactive({date: '2024/06/10'}),
		$field: 'date',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d',
		$disabled: true
	}
};

/** Sunday as first day of week. */
export const SundayFirst: Story = {
	args: {
		$model: ERO.reactive({date: '2024/06/10'}),
		$field: 'date',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d',
		firstDayOfWeek: 'sun',
		clearable: true
	}
};

/** Date picker with custom format function. */
export const CustomFormatFunc: Story = {
	args: {
		$model: ERO.reactive({date: '2024/06/10'}),
		$field: 'date',
		displayFormat: (value) => value ? value.format('MMMM D, YYYY') : (void 0),
		availableParts: 'y/m/d',
		valueFormat: 'y/m/d',
		clearable: true
	}
};

/** Time picker (hours and minutes only, no seconds). */
export const HoursMinutes: Story = {
	args: {
		$model: ERO.reactive({time: '14:30'}),
		$field: 'time',
		displayFormat: '@d:hn',
		valueFormat: 'h:n',
		clearable: true
	}
};

/** Year-month picker (no day). */
export const YearMonth: Story = {
	args: {
		$model: ERO.reactive({date: '2024/06'}),
		$field: 'date',
		displayFormat: '@d/ym',
		valueFormat: 'y/m',
		clearable: true
	}
};

/** Pure time via dayjs format string. */
export const DayjsTime: Story = {
	args: {
		$model: ERO.reactive({time: '14:30:00'}),
		$field: 'time',
		displayFormat: 'HH:mm:ss',
		valueFormat: 'h:n:s',
		availableParts: 'h:n:s',
		clearable: true
	}
};

/** Placeholder shown for empty value. */
export const Placeholder: Story = {
	args: {
		$model: ERO.reactive({date: null}),
		$field: 'date',
		displayFormat: '@d/ymd',
		valueFormat: 'y/m/d',
		placeholder: true
	}
};

// --- Non-Gregorian calendar locales ---
const localeModel = ERO.reactive({date: '2025/07/06'});

/** Saudi Arabia — islamic-umalqura */
export const LocaleArabicSA: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ar-SA'
	}
};

/** Algeria — islamic */
export const LocaleArabicDZ: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ar-DZ'
	}
};

/** Lebanon — islamic-civil */
export const LocaleArabicLB: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ar-LB'
	}
};

/** Egypt — coptic */
export const LocaleArabicEG: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ar-EG'
	}
};

/** India — indian (Saka) */
export const LocaleHindiIN: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'hi-IN'
	}
};

/** Israel — hebrew */
export const LocaleHebrewIL: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'he-IL'
	}
};

/** Japan — japanese (era-based) */
export const LocaleJapaneseJP: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ja-JP'
	}
};

/** Iran — persian */
export const LocalePersianIR: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'fa-IR'
	}
};

/** Afghanistan — persian (Dari) */
export const LocalePersianAF: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'fa-AF'
	}
};

/** Thailand — buddhist */
export const LocaleThaiTH: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'th-TH'
	}
};

/** Ethiopia — ethiopic */
export const LocaleEthiopicET: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'am-ET'
	}
};

/** Taiwan — Minguo */
export const LocaleMinguoTW: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'zh-TW'
	}
};

/** Taiwan (zh-Hant-TW) — Minguo */
export const LocaleMinguoTWHant: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'zh-Hant-TW'
	}
};

// --- Arab locale variants ---

/** United Arab Emirates — islamic-civil */
export const LocaleArabicAE: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ar-AE'
	}
};

/** Morocco — islamic */
export const LocaleArabicMA: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ar-MA'
	}
};

/** Oman — islamic-umalqura */
export const LocaleArabicOM: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ar-OM'
	}
};

/** Sudan — islamic-umalqura */
export const LocaleArabicSD: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ar-SD'
	}
};

/** Yemen — islamic-umalqura */
export const LocaleArabicYE: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ar-YE'
	}
};

// --- Persian family ---

/** Central Kurdish, Iran */
export const LocaleKurdishIR: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ckb-IR'
	}
};

/** Pashto, Afghanistan */
export const LocalePashtoAF: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ps-AF'
	}
};

/** Mazanderani, Iran */
export const LocaleMazanderaniIR: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'mzn-IR'
	}
};

/** Northern Luri, Iran */
export const LocaleLuriIR: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'lrc-IR'
	}
};

/** Uzbek (Arabic script), Afghanistan */
export const LocaleUzbekAF: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'uz-Arab-AF'
	}
};

// --- Bare language keys ---

/** Hindi (bare lang) — indian */
export const LocaleHindi: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'hi'
	}
};

/** Hebrew (bare lang) — hebrew */
export const LocaleHebrew: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'he'
	}
};

/** Japanese (bare lang) — japanese */
export const LocaleJapanese: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ja'
	}
};

/** Persian (bare lang) — persian */
export const LocalePersian: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'fa'
	}
};

/** Thai (bare lang) — buddhist */
export const LocaleThai: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'th'
	}
};

// --- English India ---

/** English (India) — indian (Saka) */
export const LocaleEnglishIN: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'en-IN'
	}
};

// --- Short-month / Narrow-weekday locales ---

/** Russian — short month */
export const LocaleRussianRU: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'ru-RU'
	}
};

/** Greek — short month */
export const LocaleGreekGR: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'el-GR'
	}
};

/** Polish — short month, narrow weekday */
export const LocalePolishPL: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'pl-PL'
	}
};

/** Lao — narrow weekday */
export const LocaleLaoLA: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'lo-LA'
	}
};

/** Burmese — narrow weekday */
export const LocaleBurmeseMM: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'my-MM'
	}
};

/** Khmer — narrow weekday */
export const LocaleKhmerKH: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'km-KH'
	}
};

/** French — narrow weekday */
export const LocaleFrenchFR: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'fr-FR'
	}
};

/** Portuguese — narrow weekday */
export const LocalePortugueseBR: Story = {
	args: {
		$model: localeModel, $field: 'date',
		displayFormat: '@d/ymd', valueFormat: 'y/m/d',
		forceLang: 'pt-BR'
	}
};
