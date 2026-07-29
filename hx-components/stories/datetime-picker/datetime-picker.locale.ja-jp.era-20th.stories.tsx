import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {createMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

const meta = createMeta('Components/Basic/DateTimePicker/Locale/Japanese/20thCentury');
export default meta;

// ---------------------------------------------------------------------------
// Japanese calendar — 20th century eras (大正 ~ 平成)
// ---------------------------------------------------------------------------

export const JaJapanese20th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1912/07/30'})} forceLang="ja-JP"
			             label="First day of 大正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1926/12/24'})} forceLang="ja-JP"
			             label="Last day of 大正"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1926/12/25'})} forceLang="ja-JP"
			             label="First day of 昭和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1989/01/07'})} forceLang="ja-JP"
			             label="Last day of 昭和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1989/01/08'})} forceLang="ja-JP"
			             label="First day of 平成"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2019/04/30'})} forceLang="ja-JP"
			             label="Last day of 平成"/>
		</HxGrid>;
	}
};
