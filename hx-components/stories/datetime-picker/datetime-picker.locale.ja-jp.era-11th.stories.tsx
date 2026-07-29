import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {createMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

const meta = createMeta('Components/Basic/DateTimePicker/Locale/Japanese/11thCentury');
export default meta;

// ---------------------------------------------------------------------------
// Japanese calendar — 11th century eras (寛弘 ~ 康和)
// ---------------------------------------------------------------------------

export const JaJapanese11th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1004/07/26'})} forceLang="ja-JP"
			             label="First day of 寛弘"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1012/12/30'})} forceLang="ja-JP"
			             label="Last day of 寛弘"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1012/12/31'})} forceLang="ja-JP"
			             label="First day of 長和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1017/04/28'})} forceLang="ja-JP"
			             label="Last day of 長和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1017/04/29'})} forceLang="ja-JP"
			             label="First day of 寛仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1021/02/07'})} forceLang="ja-JP"
			             label="Last day of 寛仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1021/02/08'})} forceLang="ja-JP"
			             label="First day of 治安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1024/07/18'})} forceLang="ja-JP"
			             label="Last day of 治安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1024/07/19'})} forceLang="ja-JP"
			             label="First day of 万寿"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1028/07/30'})} forceLang="ja-JP"
			             label="Last day of 万寿"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1028/07/31'})} forceLang="ja-JP"
			             label="First day of 長元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1037/04/26'})} forceLang="ja-JP"
			             label="Last day of 長元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1037/04/27'})} forceLang="ja-JP"
			             label="First day of 長暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1040/11/15'})} forceLang="ja-JP"
			             label="Last day of 長暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1040/11/16'})} forceLang="ja-JP"
			             label="First day of 長久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1044/11/29'})} forceLang="ja-JP"
			             label="Last day of 長久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1044/11/30'})} forceLang="ja-JP"
			             label="First day of 寛徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1046/04/19'})} forceLang="ja-JP"
			             label="Last day of 寛徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1046/04/20'})} forceLang="ja-JP"
			             label="First day of 永承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1053/01/16'})} forceLang="ja-JP"
			             label="Last day of 永承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1053/01/17'})} forceLang="ja-JP"
			             label="First day of 天喜"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1058/09/03'})} forceLang="ja-JP"
			             label="Last day of 天喜"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1058/09/04'})} forceLang="ja-JP"
			             label="First day of 康平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1065/08/07'})} forceLang="ja-JP"
			             label="Last day of 康平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1065/08/08'})} forceLang="ja-JP"
			             label="First day of 治暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1069/04/18'})} forceLang="ja-JP"
			             label="Last day of 治暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1069/04/19'})} forceLang="ja-JP"
			             label="First day of 延久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1074/08/28'})} forceLang="ja-JP"
			             label="Last day of 延久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1074/08/29'})} forceLang="ja-JP"
			             label="First day of 承保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1077/11/22'})} forceLang="ja-JP"
			             label="Last day of 承保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1077/11/23'})} forceLang="ja-JP"
			             label="First day of 承暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1081/02/15'})} forceLang="ja-JP"
			             label="Last day of 承暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1081/02/16'})} forceLang="ja-JP"
			             label="First day of 永保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1084/02/12'})} forceLang="ja-JP"
			             label="Last day of 永保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1084/02/13'})} forceLang="ja-JP"
			             label="First day of 応徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1087/04/12'})} forceLang="ja-JP"
			             label="Last day of 応徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1087/04/13'})} forceLang="ja-JP"
			             label="First day of 寛治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1094/12/20'})} forceLang="ja-JP"
			             label="Last day of 寛治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1094/12/21'})} forceLang="ja-JP"
			             label="First day of 嘉保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1096/12/22'})} forceLang="ja-JP"
			             label="Last day of 嘉保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1096/12/23'})} forceLang="ja-JP"
			             label="First day of 永長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1097/11/26'})} forceLang="ja-JP"
			             label="Last day of 永長"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1097/11/27'})} forceLang="ja-JP"
			             label="First day of 承徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1099/09/02'})} forceLang="ja-JP"
			             label="Last day of 承徳"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1099/09/03'})} forceLang="ja-JP"
			             label="First day of 康和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1104/02/16'})} forceLang="ja-JP"
			             label="Last day of 康和"/>
		</HxGrid>;
	}
};
