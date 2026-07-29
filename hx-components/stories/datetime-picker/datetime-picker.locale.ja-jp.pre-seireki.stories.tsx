import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/Seireki', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — Seireki (西暦) period before the first named era
// ---------------------------------------------------------------------------

export const JaJapaneseSeireki: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="ja-JP"
			             label="First day of 西暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0645/01/02'})} calendarLocale="ja-JP"
			             label="Last day before transition out of 西暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0645/01/03'})} calendarLocale="ja-JP"
			             label="Last day of 西暦"/>
		</HxGrid>;
	}
};
