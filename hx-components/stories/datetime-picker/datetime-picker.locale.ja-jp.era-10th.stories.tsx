import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/10thCentury', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — 10th century eras (延喜 ~ 長保)
// ---------------------------------------------------------------------------

export const JaJapanese10th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0901/07/20'})} forceLang="ja-JP"
			             label="First day of 延喜"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0923/04/15'})} forceLang="ja-JP"
			             label="Last day of 延喜"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0923/04/16'})} forceLang="ja-JP"
			             label="First day of 延長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0931/04/30'})} forceLang="ja-JP"
			             label="Last day of 延長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0931/05/01'})} forceLang="ja-JP"
			             label="First day of 承平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0938/05/26'})} forceLang="ja-JP"
			             label="Last day of 承平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0938/05/27'})} forceLang="ja-JP"
			             label="First day of 天慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0947/04/26'})} forceLang="ja-JP"
			             label="Last day of 天慶"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0947/04/27'})} forceLang="ja-JP"
			             label="First day of 天暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0957/10/31'})} forceLang="ja-JP"
			             label="Last day of 天暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0957/11/01'})} forceLang="ja-JP"
			             label="First day of 天徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0961/02/20'})} forceLang="ja-JP"
			             label="Last day of 天徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0961/02/21'})} forceLang="ja-JP"
			             label="First day of 応和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0964/07/14'})} forceLang="ja-JP"
			             label="Last day of 応和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0964/07/15'})} forceLang="ja-JP"
			             label="First day of 康保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0968/08/17'})} forceLang="ja-JP"
			             label="Last day of 康保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0968/08/18'})} forceLang="ja-JP"
			             label="First day of 安和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0970/03/29'})} forceLang="ja-JP"
			             label="Last day of 安和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0970/03/30'})} forceLang="ja-JP"
			             label="First day of 天禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0973/12/24'})} forceLang="ja-JP"
			             label="Last day of 天禄"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0973/12/25'})} forceLang="ja-JP"
			             label="First day of 天延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0976/07/17'})} forceLang="ja-JP"
			             label="Last day of 天延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0976/07/18'})} forceLang="ja-JP"
			             label="First day of 貞元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0978/12/03'})} forceLang="ja-JP"
			             label="Last day of 貞元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0978/12/04'})} forceLang="ja-JP"
			             label="First day of 天元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0983/04/19'})} forceLang="ja-JP"
			             label="Last day of 天元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0983/04/20'})} forceLang="ja-JP"
			             label="First day of 永観"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0985/05/01'})} forceLang="ja-JP"
			             label="Last day of 永観"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0985/05/02'})} forceLang="ja-JP"
			             label="First day of 寛和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0987/04/09'})} forceLang="ja-JP"
			             label="Last day of 寛和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0987/04/10'})} forceLang="ja-JP"
			             label="First day of 永延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0989/08/12'})} forceLang="ja-JP"
			             label="Last day of 永延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0989/08/13'})} forceLang="ja-JP"
			             label="First day of 永祚"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0990/11/11'})} forceLang="ja-JP"
			             label="Last day of 永祚"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0990/11/12'})} forceLang="ja-JP"
			             label="First day of 正暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0995/02/26'})} forceLang="ja-JP"
			             label="Last day of 正暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0995/02/27'})} forceLang="ja-JP"
			             label="First day of 長徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0999/01/17'})} forceLang="ja-JP"
			             label="Last day of 長徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0999/01/18'})} forceLang="ja-JP"
			             label="First day of 長保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1004/07/25'})} forceLang="ja-JP"
			             label="Last day of 長保"/>
		</HxGrid>;
	}
};
