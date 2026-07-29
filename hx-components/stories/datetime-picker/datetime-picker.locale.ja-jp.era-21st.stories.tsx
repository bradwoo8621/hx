import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/21stCentury', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — 21st century eras (令和)
// ---------------------------------------------------------------------------

export const JaJapanese21st: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '2019/05/01'})} calendarLocale="ja-JP"
			             label="First day of 令和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="ja-JP"
			             label="Someday 2026 (令和 8)"/>
		</HxGrid>;
	}
};
