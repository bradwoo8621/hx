import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/12thCentury', ...baseMeta};

// ---------------------------------------------------------------------------
// Japanese calendar — 12th century eras (長治 ~ 正治)
// ---------------------------------------------------------------------------

export const JaJapanese12th: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1104/02/17'})} calendarLocale="ja-JP"
			             label="First day of 長治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1106/04/15'})} calendarLocale="ja-JP"
			             label="Last day of 長治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1106/04/16'})} calendarLocale="ja-JP"
			             label="First day of 嘉承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1108/08/09'})} calendarLocale="ja-JP"
			             label="Last day of 嘉承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1108/08/10'})} calendarLocale="ja-JP"
			             label="First day of 天仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1110/07/19'})} calendarLocale="ja-JP"
			             label="Last day of 天仁"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1110/07/20'})} calendarLocale="ja-JP"
			             label="First day of 天永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1113/07/19'})} calendarLocale="ja-JP"
			             label="Last day of 天永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1113/07/20'})} calendarLocale="ja-JP"
			             label="First day of 永久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1118/04/09'})} calendarLocale="ja-JP"
			             label="Last day of 永久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1118/04/10'})} calendarLocale="ja-JP"
			             label="First day of 元永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1120/04/16'})} calendarLocale="ja-JP"
			             label="Last day of 元永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1120/04/17'})} calendarLocale="ja-JP"
			             label="First day of 保安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1124/04/09'})} calendarLocale="ja-JP"
			             label="Last day of 保安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1124/04/10'})} calendarLocale="ja-JP"
			             label="First day of 天治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1126/01/28'})} calendarLocale="ja-JP"
			             label="Last day of 天治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1126/01/29'})} calendarLocale="ja-JP"
			             label="First day of 大治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1131/02/04'})} calendarLocale="ja-JP"
			             label="Last day of 大治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1131/02/05'})} calendarLocale="ja-JP"
			             label="First day of 天承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1132/08/17'})} calendarLocale="ja-JP"
			             label="Last day of 天承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1132/08/18'})} calendarLocale="ja-JP"
			             label="First day of 長承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1135/05/03'})} calendarLocale="ja-JP"
			             label="Last day of 長承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1135/05/04'})} calendarLocale="ja-JP"
			             label="First day of 保延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1141/07/16'})} calendarLocale="ja-JP"
			             label="Last day of 保延"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1141/07/17'})} calendarLocale="ja-JP"
			             label="First day of 永治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1142/05/04'})} calendarLocale="ja-JP"
			             label="Last day of 永治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1142/05/05'})} calendarLocale="ja-JP"
			             label="First day of 康治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1144/02/29'})} calendarLocale="ja-JP"
			             label="Last day of 康治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1144/03/01'})} calendarLocale="ja-JP"
			             label="First day of 天養"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1145/07/28'})} calendarLocale="ja-JP"
			             label="Last day of 天養"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1145/07/29'})} calendarLocale="ja-JP"
			             label="First day of 久安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1151/02/01'})} calendarLocale="ja-JP"
			             label="Last day of 久安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1151/02/02'})} calendarLocale="ja-JP"
			             label="First day of 仁平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1154/11/03'})} calendarLocale="ja-JP"
			             label="Last day of 仁平"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1154/11/04'})} calendarLocale="ja-JP"
			             label="First day of 久寿"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1156/05/03'})} calendarLocale="ja-JP"
			             label="Last day of 久寿"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1156/05/04'})} calendarLocale="ja-JP"
			             label="First day of 保元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1159/04/26'})} calendarLocale="ja-JP"
			             label="Last day of 保元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1159/04/27'})} calendarLocale="ja-JP"
			             label="First day of 平治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1160/01/16'})} calendarLocale="ja-JP"
			             label="Last day of 平治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1160/01/17'})} calendarLocale="ja-JP"
			             label="First day of 永暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1161/09/10'})} calendarLocale="ja-JP"
			             label="Last day of 永暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1161/09/11'})} calendarLocale="ja-JP"
			             label="First day of 応保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1163/04/04'})} calendarLocale="ja-JP"
			             label="Last day of 応保"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1163/04/05'})} calendarLocale="ja-JP"
			             label="First day of 長寛"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1165/06/11'})} calendarLocale="ja-JP"
			             label="Last day of 長寛"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1165/06/12'})} calendarLocale="ja-JP"
			             label="First day of 永万"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1166/09/02'})} calendarLocale="ja-JP"
			             label="Last day of 永万"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1166/09/03'})} calendarLocale="ja-JP"
			             label="First day of 仁安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1169/04/14'})} calendarLocale="ja-JP"
			             label="Last day of 仁安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1169/04/15'})} calendarLocale="ja-JP"
			             label="First day of 嘉応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1171/04/27'})} calendarLocale="ja-JP"
			             label="Last day of 嘉応"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1171/04/28'})} calendarLocale="ja-JP"
			             label="First day of 承安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1175/08/03'})} calendarLocale="ja-JP"
			             label="Last day of 承安"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1175/08/04'})} calendarLocale="ja-JP"
			             label="First day of 安元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1177/08/10'})} calendarLocale="ja-JP"
			             label="Last day of 安元"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1177/08/11'})} calendarLocale="ja-JP"
			             label="First day of 治承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1181/07/20'})} calendarLocale="ja-JP"
			             label="Last day of 治承"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1181/07/21'})} calendarLocale="ja-JP"
			             label="First day of 養和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1182/06/02'})} calendarLocale="ja-JP"
			             label="Last day of 養和"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1182/06/03'})} calendarLocale="ja-JP"
			             label="First day of 寿永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1184/04/22'})} calendarLocale="ja-JP"
			             label="Last day of 寿永"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1184/04/23'})} calendarLocale="ja-JP"
			             label="First day of 元暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1185/08/20'})} calendarLocale="ja-JP"
			             label="Last day of 元暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1185/08/21'})} calendarLocale="ja-JP"
			             label="First day of 文治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1190/04/17'})} calendarLocale="ja-JP"
			             label="Last day of 文治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1190/04/18'})} calendarLocale="ja-JP"
			             label="First day of 建久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1199/05/03'})} calendarLocale="ja-JP"
			             label="Last day of 建久"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1199/05/04'})} calendarLocale="ja-JP"
			             label="First day of 正治"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1201/02/19'})} calendarLocale="ja-JP"
			             label="Last day of 正治"/>
		</HxGrid>;
	}
};
