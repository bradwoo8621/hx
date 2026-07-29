import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/07thCentury', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — 7th century eras (大化 ~ 朱鳥)
// ---------------------------------------------------------------------------

export const JaJapanese07th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0645/01/04'})} forceLang="ja-JP"
			             label="First day of 大化"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0650/02/17'})} forceLang="ja-JP"
			             label="Last day of 大化"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0650/02/18'})} forceLang="ja-JP"
			             label="First day of 白雉"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0672/01/03'})} forceLang="ja-JP"
			             label="Last day of 白雉"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0672/01/04'})} forceLang="ja-JP"
			             label="First day of 白鳳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0686/07/22'})} forceLang="ja-JP"
			             label="Last day of 白鳳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0686/07/23'})} forceLang="ja-JP"
			             label="First day of 朱鳥"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0701/03/24'})} forceLang="ja-JP"
			             label="Last day of 朱鳥"/>
		</HxGrid>;
	}
};
