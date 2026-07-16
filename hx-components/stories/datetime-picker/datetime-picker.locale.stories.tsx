import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxDateTimePicker, type HxDateTimePickerProps, type HxObject} from '../../src';

const meta: Meta<typeof HxDateTimePicker> = {
	title: 'Components/Basic/DateTimePicker/Locale',
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

const localeModel = ERO.reactive({date: '2025/07/06'});
const newLocaleModel = (date: string) => ERO.reactive({date});

const LocaleStory = ({$model, lang, purpose, ...props}: Partial<HxDateTimePickerProps<typeof localeModel>> & {
	$model?: HxObject<typeof localeModel>;
	lang: string;
	purpose: string
}) => (
	<div style={{display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center'}}>
		<div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px'}}>
			<code style={{
				background: 'var(--hx-color-bg-secondary, #f0f0f0)',
				padding: '2px 8px',
				borderRadius: '4px',
				fontWeight: 600
			}}>
				{lang}
			</code>
			<span style={{color: 'var(--hx-color-text-secondary, #666)'}}>{purpose}</span>
		</div>
		<HxDateTimePicker
			$model={$model ?? localeModel}
			$field="date"
			displayFormat="@d/ymd"
			valueFormat="y/m/d"
			forceLang={lang}
			{...props}
		/>
	</div>
);

// ── Non-Gregorian calendar locales ────────────────────────────────────────

/** islamic-umalqura calendar locale test */
export const SaudiArabia: Story = {
	render: () => <LocaleStory lang="ar-SA" purpose="islamic-umalqura calendar"/>
};

/** islamic calendar locale test */
export const Algeria: Story = {
	render: () => <LocaleStory lang="ar-DZ" purpose="islamic calendar"/>
};

/** islamic-civil calendar locale test */
export const Lebanon: Story = {
	render: () => <LocaleStory lang="ar-LB" purpose="islamic-civil calendar"/>
};

/** coptic calendar locale test */
export const EgyptCoptic: Story = {
	render: () => <LocaleStory lang="ar-EG" purpose="coptic calendar"/>
};

/** Saka calendar locale test */
export const IndiaSaka: Story = {
	render: () => <LocaleStory lang="hi-IN" purpose="indian (Saka) calendar"/>
};

/** hebrew calendar locale test */
export const IsraelHebrew: Story = {
	render: () => <LocaleStory lang="he-IL" purpose="hebrew calendar"/>
};

/** era-based calendar locale test */
export const JapanEra: Story = {
	render: () => <LocaleStory lang="ja-JP" purpose="japanese era-based calendar"/>
};

/** persian calendar locale test */
export const IranPersian: Story = {
	render: () => <LocaleStory lang="fa-IR" purpose="persian calendar"/>
};

/** persian (Dari) calendar locale test */
export const AfghanistanDari: Story = {
	render: () => <LocaleStory lang="fa-AF" purpose="persian (Dari) calendar"/>
};

/** buddhist calendar locale test */
export const ThailandBuddhist: Story = {
	render: () => <LocaleStory lang="th-TH" purpose="buddhist calendar"/>
};

/** ethiopic calendar locale test */
export const EthiopiaEthiopic: Story = {
	render: () => <LocaleStory lang="am-ET" purpose="ethiopic calendar"/>
};

/** Minguo calendar locale test */
export const TaiwanMinguo: Story = {
	render: () => <LocaleStory lang="zh-TW" purpose="Minguo calendar"/>
};

/** Minguo calendar locale test (Hant variant) */
export const TaiwanMinguoHant: Story = {
	render: () => <LocaleStory lang="zh-Hant-TW" purpose="Minguo calendar (Hant)"/>
};

export const TaiwanMinguoHant2: Story = {
	render: () => <LocaleStory lang="zh-Hant-TW" purpose="Minguo calendar (Hant)"
	                           $model={newLocaleModel('1911/12/31')}/>
};

// ── Arab locale variants — calendar ───────────────────────────────────────

/** islamic-civil calendar locale test */
export const UAE: Story = {
	render: () => <LocaleStory lang="ar-AE" purpose="islamic-civil calendar"/>
};

/** islamic calendar locale test */
export const Morocco: Story = {
	render: () => <LocaleStory lang="ar-MA" purpose="islamic calendar"/>
};

/** islamic-umalqura calendar locale test */
export const Oman: Story = {
	render: () => <LocaleStory lang="ar-OM" purpose="islamic-umalqura calendar"/>
};

/** islamic-umalqura calendar locale test */
export const Sudan: Story = {
	render: () => <LocaleStory lang="ar-SD" purpose="islamic-umalqura calendar"/>
};

/** islamic-umalqura calendar locale test */
export const Yemen: Story = {
	render: () => <LocaleStory lang="ar-YE" purpose="islamic-umalqura calendar"/>
};

// ── Persian family — calendar ─────────────────────────────────────────────

/** persian calendar locale test */
export const IranKurdish: Story = {
	render: () => <LocaleStory lang="ckb-IR" purpose="persian calendar (Central Kurdish)"/>
};

/** persian calendar locale test */
export const AfghanistanPashto: Story = {
	render: () => <LocaleStory lang="ps-AF" purpose="persian calendar (Pashto)"/>
};

/** persian calendar locale test */
export const IranMazanderani: Story = {
	render: () => <LocaleStory lang="mzn-IR" purpose="persian calendar (Mazanderani)"/>
};

/** persian calendar locale test */
export const IranLuri: Story = {
	render: () => <LocaleStory lang="lrc-IR" purpose="persian calendar (Northern Luri)"/>
};

/** persian calendar locale test */
export const AfghanistanUzbek: Story = {
	render: () => <LocaleStory lang="uz-Arab-AF" purpose="persian calendar (Uzbek Arabic)"/>
};

// ── Saka calendar (English) — calendar ────────────────────────────────────

/** Saka calendar locale test */
export const IndiaEnglish: Story = {
	render: () => <LocaleStory lang="en-IN" purpose="indian (Saka) calendar with English labels"/>
};

// ── Bare language keys — locale resolution ────────────────────────────────

/** locale resolution — bare lang key resolves to Saka calendar */
export const HindiBare: Story = {
	render: () => <LocaleStory lang="hi" purpose="bare lang → Saka calendar"/>
};

/** locale resolution — bare lang key resolves to hebrew calendar */
export const HebrewBare: Story = {
	render: () => <LocaleStory lang="he" purpose="bare lang → hebrew calendar"/>
};

/** locale resolution — bare lang key resolves to era-based calendar */
export const JapaneseBare: Story = {
	render: () => <LocaleStory lang="ja" purpose="bare lang → era-based calendar"/>
};

/** locale resolution — bare lang key resolves to persian calendar */
export const PersianBare: Story = {
	render: () => <LocaleStory lang="fa" purpose="bare lang → persian calendar"/>
};

/** locale resolution — bare lang key resolves to buddhist calendar */
export const ThaiBare: Story = {
	render: () => <LocaleStory lang="th" purpose="bare lang → buddhist calendar"/>
};

// ── Month / Weekday label formatting ──────────────────────────────────────

/** short month label test */
export const Russia: Story = {
	render: () => <LocaleStory lang="ru-RU" purpose="short month labels"/>
};

/** short month label test */
export const Greece: Story = {
	render: () => <LocaleStory lang="el-GR" purpose="short month labels"/>
};

/** short month + narrow weekday label test */
export const Poland: Story = {
	render: () => <LocaleStory lang="pl-PL" purpose="short month + narrow weekday labels"/>
};

/** narrow weekday label test */
export const Laos: Story = {
	render: () => <LocaleStory lang="lo-LA" purpose="narrow weekday labels"/>
};

/** narrow weekday label test */
export const Myanmar: Story = {
	render: () => <LocaleStory lang="my-MM" purpose="narrow weekday labels"/>
};

/** narrow weekday label test */
export const Cambodia: Story = {
	render: () => <LocaleStory lang="km-KH" purpose="narrow weekday labels"/>
};

/** narrow weekday label test */
export const France: Story = {
	render: () => <LocaleStory lang="fr-FR" purpose="narrow weekday labels"/>
};

/** narrow weekday label test */
export const Brazil: Story = {
	render: () => <LocaleStory lang="pt-BR" purpose="narrow weekday labels"/>
};
