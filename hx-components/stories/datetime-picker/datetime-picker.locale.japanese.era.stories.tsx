import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStoryForDateOnly} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Japanese/Era', ...baseMeta};

// --- Seireki (西暦) — pre-era period ---

export const JaJapaneseSeireki: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="ja-JP"
			                        label="First day of 西暦"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0645/01/02'})} calendarLocale="ja-JP"
			                        label="Last day before transition out of 西暦"/>
			<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0645/01/03'})} calendarLocale="ja-JP"
			                        label="Last day of 西暦"/>
		</HxGrid>;
	}
};

// --- 7th century (大化 ~ 朱鳥) ---

export const JaJapanese07th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0645/01/04'})} calendarLocale="ja-JP" label="First day of 大化"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0650/02/17'})} calendarLocale="ja-JP" label="Last day of 大化"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0650/02/18'})} calendarLocale="ja-JP" label="First day of 白雉"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0672/01/03'})} calendarLocale="ja-JP" label="Last day of 白雉"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0672/01/04'})} calendarLocale="ja-JP" label="First day of 白鳳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0686/07/22'})} calendarLocale="ja-JP" label="Last day of 白鳳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0686/07/23'})} calendarLocale="ja-JP" label="First day of 朱鳥"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0701/03/24'})} calendarLocale="ja-JP" label="Last day of 朱鳥"/>
	</HxGrid>
};

// --- 8th century (大宝 ~ 延暦) ---

export const JaJapanese08th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0701/03/25'})} calendarLocale="ja-JP" label="First day of 大宝"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0704/05/13'})} calendarLocale="ja-JP" label="Last day of 大宝"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0704/05/14'})} calendarLocale="ja-JP" label="First day of 慶雲"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0708/01/14'})} calendarLocale="ja-JP" label="Last day of 慶雲"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0708/01/15'})} calendarLocale="ja-JP" label="First day of 和銅"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0715/09/05'})} calendarLocale="ja-JP" label="Last day of 和銅"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0715/09/06'})} calendarLocale="ja-JP" label="First day of 霊亀"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0717/11/20'})} calendarLocale="ja-JP" label="Last day of 霊亀"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0717/11/21'})} calendarLocale="ja-JP" label="First day of 養老"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0724/02/07'})} calendarLocale="ja-JP" label="Last day of 養老"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0724/02/08'})} calendarLocale="ja-JP" label="First day of 神亀"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0729/08/08'})} calendarLocale="ja-JP" label="Last day of 神亀"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0729/08/09'})} calendarLocale="ja-JP" label="First day of 天平"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0749/04/17'})} calendarLocale="ja-JP" label="Last day of 天平"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0749/04/18'})} calendarLocale="ja-JP" label="First day of 天平感宝"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0749/07/05'})} calendarLocale="ja-JP" label="Last day of 天平感宝"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0749/07/06'})} calendarLocale="ja-JP" label="First day of 天平勝宝"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0757/08/21'})} calendarLocale="ja-JP" label="Last day of 天平勝宝"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0757/08/22'})} calendarLocale="ja-JP" label="First day of 天平宝字"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0765/01/10'})} calendarLocale="ja-JP" label="Last day of 天平宝字"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0765/01/11'})} calendarLocale="ja-JP" label="First day of 天平神護"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0767/08/19'})} calendarLocale="ja-JP" label="Last day of 天平神護"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0767/08/20'})} calendarLocale="ja-JP" label="First day of 神護景雲"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0770/10/04'})} calendarLocale="ja-JP" label="Last day of 神護景雲"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0770/10/05'})} calendarLocale="ja-JP" label="First day of 宝亀"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0781/01/04'})} calendarLocale="ja-JP" label="Last day of 宝亀"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0781/01/05'})} calendarLocale="ja-JP" label="First day of 天応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0782/08/22'})} calendarLocale="ja-JP" label="Last day of 天応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0782/08/23'})} calendarLocale="ja-JP" label="First day of 延暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0806/05/21'})} calendarLocale="ja-JP" label="Last day of 延暦"/>
	</HxGrid>
};

// --- 9th century (大同 ~ 昌泰) ---

export const JaJapanese09th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0806/05/22'})} calendarLocale="ja-JP" label="First day of 大同"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0810/09/22'})} calendarLocale="ja-JP" label="Last day of 大同"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0810/09/23'})} calendarLocale="ja-JP" label="First day of 弘仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0824/01/08'})} calendarLocale="ja-JP" label="Last day of 弘仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0824/01/09'})} calendarLocale="ja-JP" label="First day of 天長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0834/01/06'})} calendarLocale="ja-JP" label="Last day of 天長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0834/01/07'})} calendarLocale="ja-JP" label="First day of 承和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0848/06/16'})} calendarLocale="ja-JP" label="Last day of 承和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0848/06/17'})} calendarLocale="ja-JP" label="First day of 嘉祥"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0851/05/01'})} calendarLocale="ja-JP" label="Last day of 嘉祥"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0851/05/02'})} calendarLocale="ja-JP" label="First day of 仁寿"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0854/12/03'})} calendarLocale="ja-JP" label="Last day of 仁寿"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0854/12/04'})} calendarLocale="ja-JP" label="First day of 斉衡"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0857/02/24'})} calendarLocale="ja-JP" label="Last day of 斉衡"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0857/02/25'})} calendarLocale="ja-JP" label="First day of 天安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0859/04/18'})} calendarLocale="ja-JP" label="Last day of 天安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0859/04/19'})} calendarLocale="ja-JP" label="First day of 貞観"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0877/04/19'})} calendarLocale="ja-JP" label="Last day of 貞観"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0877/04/20'})} calendarLocale="ja-JP" label="First day of 元慶"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0885/02/24'})} calendarLocale="ja-JP" label="Last day of 元慶"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0885/02/25'})} calendarLocale="ja-JP" label="First day of 仁和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0889/04/30'})} calendarLocale="ja-JP" label="Last day of 仁和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0889/05/01'})} calendarLocale="ja-JP" label="First day of 寛平"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0898/04/29'})} calendarLocale="ja-JP" label="Last day of 寛平"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0898/04/30'})} calendarLocale="ja-JP" label="First day of 昌泰"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0901/07/19'})} calendarLocale="ja-JP" label="Last day of 昌泰"/>
	</HxGrid>
};

// --- 10th century (延喜 ~ 長保) ---

export const JaJapanese10th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0901/07/20'})} calendarLocale="ja-JP" label="First day of 延喜"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0923/04/15'})} calendarLocale="ja-JP" label="Last day of 延喜"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0923/04/16'})} calendarLocale="ja-JP" label="First day of 延長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0931/04/30'})} calendarLocale="ja-JP" label="Last day of 延長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0931/05/01'})} calendarLocale="ja-JP" label="First day of 承平"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0938/05/26'})} calendarLocale="ja-JP" label="Last day of 承平"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0938/05/27'})} calendarLocale="ja-JP" label="First day of 天慶"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0947/04/26'})} calendarLocale="ja-JP" label="Last day of 天慶"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0947/04/27'})} calendarLocale="ja-JP" label="First day of 天暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0957/10/31'})} calendarLocale="ja-JP" label="Last day of 天暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0957/11/01'})} calendarLocale="ja-JP" label="First day of 天徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0961/02/20'})} calendarLocale="ja-JP" label="Last day of 天徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0961/02/21'})} calendarLocale="ja-JP" label="First day of 応和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0964/07/14'})} calendarLocale="ja-JP" label="Last day of 応和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0964/07/15'})} calendarLocale="ja-JP" label="First day of 康保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0968/08/17'})} calendarLocale="ja-JP" label="Last day of 康保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0968/08/18'})} calendarLocale="ja-JP" label="First day of 安和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0970/03/29'})} calendarLocale="ja-JP" label="Last day of 安和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0970/03/30'})} calendarLocale="ja-JP" label="First day of 天禄"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0973/12/24'})} calendarLocale="ja-JP" label="Last day of 天禄"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0973/12/25'})} calendarLocale="ja-JP" label="First day of 天延"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0976/07/17'})} calendarLocale="ja-JP" label="Last day of 天延"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0976/07/18'})} calendarLocale="ja-JP" label="First day of 貞元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0978/12/03'})} calendarLocale="ja-JP" label="Last day of 貞元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0978/12/04'})} calendarLocale="ja-JP" label="First day of 天元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0983/04/19'})} calendarLocale="ja-JP" label="Last day of 天元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0983/04/20'})} calendarLocale="ja-JP" label="First day of 永観"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0985/05/01'})} calendarLocale="ja-JP" label="Last day of 永観"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0985/05/02'})} calendarLocale="ja-JP" label="First day of 寛和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0987/04/09'})} calendarLocale="ja-JP" label="Last day of 寛和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0987/04/10'})} calendarLocale="ja-JP" label="First day of 永延"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0989/08/12'})} calendarLocale="ja-JP" label="Last day of 永延"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0989/08/13'})} calendarLocale="ja-JP" label="First day of 永祚"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0990/11/11'})} calendarLocale="ja-JP" label="Last day of 永祚"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0990/11/12'})} calendarLocale="ja-JP" label="First day of 正暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0995/02/26'})} calendarLocale="ja-JP" label="Last day of 正暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0995/02/27'})} calendarLocale="ja-JP" label="First day of 長徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0999/01/17'})} calendarLocale="ja-JP" label="Last day of 長徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '0999/01/18'})} calendarLocale="ja-JP" label="First day of 長保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1004/07/25'})} calendarLocale="ja-JP" label="Last day of 長保"/>
	</HxGrid>
};

// --- 11th century (寛弘 ~ 康和) ---

export const JaJapanese11th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1004/07/26'})} calendarLocale="ja-JP" label="First day of 寛弘"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1012/12/30'})} calendarLocale="ja-JP" label="Last day of 寛弘"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1012/12/31'})} calendarLocale="ja-JP" label="First day of 長和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1017/04/28'})} calendarLocale="ja-JP" label="Last day of 長和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1017/04/29'})} calendarLocale="ja-JP" label="First day of 寛仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1021/02/07'})} calendarLocale="ja-JP" label="Last day of 寛仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1021/02/08'})} calendarLocale="ja-JP" label="First day of 治安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1024/07/18'})} calendarLocale="ja-JP" label="Last day of 治安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1024/07/19'})} calendarLocale="ja-JP" label="First day of 万寿"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1028/07/30'})} calendarLocale="ja-JP" label="Last day of 万寿"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1028/07/31'})} calendarLocale="ja-JP" label="First day of 長元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1037/04/26'})} calendarLocale="ja-JP" label="Last day of 長元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1037/04/27'})} calendarLocale="ja-JP" label="First day of 長暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1040/11/15'})} calendarLocale="ja-JP" label="Last day of 長暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1040/11/16'})} calendarLocale="ja-JP" label="First day of 長久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1044/11/29'})} calendarLocale="ja-JP" label="Last day of 長久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1044/11/30'})} calendarLocale="ja-JP" label="First day of 寛徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1046/04/19'})} calendarLocale="ja-JP" label="Last day of 寛徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1046/04/20'})} calendarLocale="ja-JP" label="First day of 永承"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1053/01/16'})} calendarLocale="ja-JP" label="Last day of 永承"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1053/01/17'})} calendarLocale="ja-JP" label="First day of 天喜"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1058/09/03'})} calendarLocale="ja-JP" label="Last day of 天喜"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1058/09/04'})} calendarLocale="ja-JP" label="First day of 康平"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1065/08/07'})} calendarLocale="ja-JP" label="Last day of 康平"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1065/08/08'})} calendarLocale="ja-JP" label="First day of 治暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1069/04/18'})} calendarLocale="ja-JP" label="Last day of 治暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1069/04/19'})} calendarLocale="ja-JP" label="First day of 延久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1074/08/28'})} calendarLocale="ja-JP" label="Last day of 延久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1074/08/29'})} calendarLocale="ja-JP" label="First day of 承保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1077/11/22'})} calendarLocale="ja-JP" label="Last day of 承保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1077/11/23'})} calendarLocale="ja-JP" label="First day of 承暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1081/02/15'})} calendarLocale="ja-JP" label="Last day of 承暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1081/02/16'})} calendarLocale="ja-JP" label="First day of 永保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1084/02/12'})} calendarLocale="ja-JP" label="Last day of 永保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1084/02/13'})} calendarLocale="ja-JP" label="First day of 応徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1087/04/12'})} calendarLocale="ja-JP" label="Last day of 応徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1087/04/13'})} calendarLocale="ja-JP" label="First day of 寛治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1094/12/20'})} calendarLocale="ja-JP" label="Last day of 寛治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1094/12/21'})} calendarLocale="ja-JP" label="First day of 嘉保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1096/12/22'})} calendarLocale="ja-JP" label="Last day of 嘉保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1096/12/23'})} calendarLocale="ja-JP" label="First day of 永長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1097/11/26'})} calendarLocale="ja-JP" label="Last day of 永長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1097/11/27'})} calendarLocale="ja-JP" label="First day of 承徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1099/09/02'})} calendarLocale="ja-JP" label="Last day of 承徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1099/09/03'})} calendarLocale="ja-JP" label="First day of 康和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1104/02/16'})} calendarLocale="ja-JP" label="Last day of 康和"/>
	</HxGrid>
};

// --- 12th century (長治 ~ 正治) ---

export const JaJapanese12th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1104/02/17'})} calendarLocale="ja-JP" label="First day of 長治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1106/04/15'})} calendarLocale="ja-JP" label="Last day of 長治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1106/04/16'})} calendarLocale="ja-JP" label="First day of 嘉承"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1108/08/09'})} calendarLocale="ja-JP" label="Last day of 嘉承"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1108/08/10'})} calendarLocale="ja-JP" label="First day of 天仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1110/07/19'})} calendarLocale="ja-JP" label="Last day of 天仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1110/07/20'})} calendarLocale="ja-JP" label="First day of 天永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1113/07/19'})} calendarLocale="ja-JP" label="Last day of 天永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1113/07/20'})} calendarLocale="ja-JP" label="First day of 永久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1118/04/09'})} calendarLocale="ja-JP" label="Last day of 永久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1118/04/10'})} calendarLocale="ja-JP" label="First day of 元永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1120/04/16'})} calendarLocale="ja-JP" label="Last day of 元永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1120/04/17'})} calendarLocale="ja-JP" label="First day of 保安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1124/04/09'})} calendarLocale="ja-JP" label="Last day of 保安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1124/04/10'})} calendarLocale="ja-JP" label="First day of 天治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1126/01/28'})} calendarLocale="ja-JP" label="Last day of 天治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1126/01/29'})} calendarLocale="ja-JP" label="First day of 大治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1131/02/04'})} calendarLocale="ja-JP" label="Last day of 大治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1131/02/05'})} calendarLocale="ja-JP" label="First day of 天承"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1132/08/17'})} calendarLocale="ja-JP" label="Last day of 天承"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1132/08/18'})} calendarLocale="ja-JP" label="First day of 長承"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1135/05/03'})} calendarLocale="ja-JP" label="Last day of 長承"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1135/05/04'})} calendarLocale="ja-JP" label="First day of 保延"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1141/07/16'})} calendarLocale="ja-JP" label="Last day of 保延"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1141/07/17'})} calendarLocale="ja-JP" label="First day of 永治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1142/05/04'})} calendarLocale="ja-JP" label="Last day of 永治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1142/05/05'})} calendarLocale="ja-JP" label="First day of 康治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1144/02/29'})} calendarLocale="ja-JP" label="Last day of 康治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1144/03/01'})} calendarLocale="ja-JP" label="First day of 天養"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1145/07/28'})} calendarLocale="ja-JP" label="Last day of 天養"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1145/07/29'})} calendarLocale="ja-JP" label="First day of 久安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1151/02/01'})} calendarLocale="ja-JP" label="Last day of 久安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1151/02/02'})} calendarLocale="ja-JP" label="First day of 仁平"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1154/11/03'})} calendarLocale="ja-JP" label="Last day of 仁平"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1154/11/04'})} calendarLocale="ja-JP" label="First day of 久寿"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1156/05/03'})} calendarLocale="ja-JP" label="Last day of 久寿"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1156/05/04'})} calendarLocale="ja-JP" label="First day of 保元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1159/04/26'})} calendarLocale="ja-JP" label="Last day of 保元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1159/04/27'})} calendarLocale="ja-JP" label="First day of 平治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1160/01/16'})} calendarLocale="ja-JP" label="Last day of 平治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1160/01/17'})} calendarLocale="ja-JP" label="First day of 永暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1161/09/10'})} calendarLocale="ja-JP" label="Last day of 永暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1161/09/11'})} calendarLocale="ja-JP" label="First day of 応保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1163/04/04'})} calendarLocale="ja-JP" label="Last day of 応保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1163/04/05'})} calendarLocale="ja-JP" label="First day of 長寛"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1165/06/11'})} calendarLocale="ja-JP" label="Last day of 長寛"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1165/06/12'})} calendarLocale="ja-JP" label="First day of 永万"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1166/09/02'})} calendarLocale="ja-JP" label="Last day of 永万"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1166/09/03'})} calendarLocale="ja-JP" label="First day of 仁安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1169/04/14'})} calendarLocale="ja-JP" label="Last day of 仁安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1169/04/15'})} calendarLocale="ja-JP" label="First day of 嘉応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1171/04/27'})} calendarLocale="ja-JP" label="Last day of 嘉応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1171/04/28'})} calendarLocale="ja-JP" label="First day of 承安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1175/08/03'})} calendarLocale="ja-JP" label="Last day of 承安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1175/08/04'})} calendarLocale="ja-JP" label="First day of 安元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1177/08/10'})} calendarLocale="ja-JP" label="Last day of 安元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1177/08/11'})} calendarLocale="ja-JP" label="First day of 治承"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1181/07/20'})} calendarLocale="ja-JP" label="Last day of 治承"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1181/07/21'})} calendarLocale="ja-JP" label="First day of 養和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1182/06/02'})} calendarLocale="ja-JP" label="Last day of 養和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1182/06/03'})} calendarLocale="ja-JP" label="First day of 寿永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1184/04/22'})} calendarLocale="ja-JP" label="Last day of 寿永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1184/04/23'})} calendarLocale="ja-JP" label="First day of 元暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1185/08/20'})} calendarLocale="ja-JP" label="Last day of 元暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1185/08/21'})} calendarLocale="ja-JP" label="First day of 文治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1190/04/17'})} calendarLocale="ja-JP" label="Last day of 文治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1190/04/18'})} calendarLocale="ja-JP" label="First day of 建久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1199/05/03'})} calendarLocale="ja-JP" label="Last day of 建久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1199/05/04'})} calendarLocale="ja-JP" label="First day of 正治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1201/02/19'})} calendarLocale="ja-JP" label="Last day of 正治"/>
	</HxGrid>
};

// --- 13th century (建仁 ~ 正安) ---

export const JaJapanese13th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1201/02/20'})} calendarLocale="ja-JP" label="First day of 建仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1204/02/26'})} calendarLocale="ja-JP" label="Last day of 建仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1204/02/27'})} calendarLocale="ja-JP" label="First day of 元久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1206/05/03'})} calendarLocale="ja-JP" label="Last day of 元久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1206/05/04'})} calendarLocale="ja-JP" label="First day of 建永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1207/10/31'})} calendarLocale="ja-JP" label="Last day of 建永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1207/11/01'})} calendarLocale="ja-JP" label="First day of 承元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1211/03/15'})} calendarLocale="ja-JP" label="Last day of 承元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1211/03/16'})} calendarLocale="ja-JP" label="First day of 建暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1213/12/12'})} calendarLocale="ja-JP" label="Last day of 建暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1213/12/13'})} calendarLocale="ja-JP" label="First day of 建保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1219/04/18'})} calendarLocale="ja-JP" label="Last day of 建保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1219/04/19'})} calendarLocale="ja-JP" label="First day of 承久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1222/04/19'})} calendarLocale="ja-JP" label="Last day of 承久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1222/04/20'})} calendarLocale="ja-JP" label="First day of 貞応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1224/11/26'})} calendarLocale="ja-JP" label="Last day of 貞応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1224/11/27'})} calendarLocale="ja-JP" label="First day of 元仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1225/04/26'})} calendarLocale="ja-JP" label="Last day of 元仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1225/04/27'})} calendarLocale="ja-JP" label="First day of 嘉禄"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1227/12/16'})} calendarLocale="ja-JP" label="Last day of 嘉禄"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1227/12/17'})} calendarLocale="ja-JP" label="First day of 安貞"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1229/03/11'})} calendarLocale="ja-JP" label="Last day of 安貞"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1229/03/12'})} calendarLocale="ja-JP" label="First day of 寛喜"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1232/04/08'})} calendarLocale="ja-JP" label="Last day of 寛喜"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1232/04/09'})} calendarLocale="ja-JP" label="First day of 貞永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1233/04/21'})} calendarLocale="ja-JP" label="Last day of 貞永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1233/04/22'})} calendarLocale="ja-JP" label="First day of 天福"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1234/11/11'})} calendarLocale="ja-JP" label="Last day of 天福"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1234/11/12'})} calendarLocale="ja-JP" label="First day of 文暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1235/09/25'})} calendarLocale="ja-JP" label="Last day of 文暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1235/09/26'})} calendarLocale="ja-JP" label="First day of 嘉禎"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1238/11/29'})} calendarLocale="ja-JP" label="Last day of 嘉禎"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1238/11/30'})} calendarLocale="ja-JP" label="First day of 暦仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1239/02/13'})} calendarLocale="ja-JP" label="Last day of 暦仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1239/02/14'})} calendarLocale="ja-JP" label="First day of 延応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1240/07/22'})} calendarLocale="ja-JP" label="Last day of 延応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1240/07/23'})} calendarLocale="ja-JP" label="First day of 仁治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1243/03/04'})} calendarLocale="ja-JP" label="Last day of 仁治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1243/03/05'})} calendarLocale="ja-JP" label="First day of 寛元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1247/03/06'})} calendarLocale="ja-JP" label="Last day of 寛元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1247/03/07'})} calendarLocale="ja-JP" label="First day of 宝治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1249/03/24'})} calendarLocale="ja-JP" label="Last day of 宝治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1249/03/25'})} calendarLocale="ja-JP" label="First day of 建長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1256/10/11'})} calendarLocale="ja-JP" label="Last day of 建長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1256/10/12'})} calendarLocale="ja-JP" label="First day of 康元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1257/03/20'})} calendarLocale="ja-JP" label="Last day of 康元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1257/03/21'})} calendarLocale="ja-JP" label="First day of 正嘉"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1259/04/01'})} calendarLocale="ja-JP" label="Last day of 正嘉"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1259/04/02'})} calendarLocale="ja-JP" label="First day of 正元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1260/04/19'})} calendarLocale="ja-JP" label="Last day of 正元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1260/04/20'})} calendarLocale="ja-JP" label="First day of 文応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1261/02/26'})} calendarLocale="ja-JP" label="Last day of 文応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1261/02/27'})} calendarLocale="ja-JP" label="First day of 弘長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1264/03/05'})} calendarLocale="ja-JP" label="Last day of 弘長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1264/03/06'})} calendarLocale="ja-JP" label="First day of 文永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1275/05/01'})} calendarLocale="ja-JP" label="Last day of 文永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1275/05/02'})} calendarLocale="ja-JP" label="First day of 建治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1278/03/07'})} calendarLocale="ja-JP" label="Last day of 建治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1278/03/08'})} calendarLocale="ja-JP" label="First day of 弘安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1288/05/04'})} calendarLocale="ja-JP" label="Last day of 弘安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1288/05/05'})} calendarLocale="ja-JP" label="First day of 正応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1293/08/11'})} calendarLocale="ja-JP" label="Last day of 正応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1293/08/12'})} calendarLocale="ja-JP" label="First day of 永仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1299/05/01'})} calendarLocale="ja-JP" label="Last day of 永仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1299/05/02'})} calendarLocale="ja-JP" label="First day of 正安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1302/11/28'})} calendarLocale="ja-JP" label="Last day of 正安"/>
	</HxGrid>
};

// --- 14th century (乾元 ~ 応永) ---

export const JaJapanese14th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1302/11/29'})} calendarLocale="ja-JP" label="First day of 乾元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1303/08/12'})} calendarLocale="ja-JP" label="Last day of 乾元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1303/08/13'})} calendarLocale="ja-JP" label="First day of 嘉元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1306/12/21'})} calendarLocale="ja-JP" label="Last day of 嘉元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1306/12/22'})} calendarLocale="ja-JP" label="First day of 徳治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1308/10/16'})} calendarLocale="ja-JP" label="Last day of 徳治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1308/10/17'})} calendarLocale="ja-JP" label="First day of 延慶"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1311/05/05'})} calendarLocale="ja-JP" label="Last day of 延慶"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1311/05/06'})} calendarLocale="ja-JP" label="First day of 応長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1312/03/27'})} calendarLocale="ja-JP" label="Last day of 応長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1312/03/28'})} calendarLocale="ja-JP" label="First day of 正和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1317/02/10'})} calendarLocale="ja-JP" label="Last day of 正和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1317/02/11'})} calendarLocale="ja-JP" label="First day of 文保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1319/05/05'})} calendarLocale="ja-JP" label="Last day of 文保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1319/05/06'})} calendarLocale="ja-JP" label="First day of 元応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1321/03/02'})} calendarLocale="ja-JP" label="Last day of 元応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1321/03/03'})} calendarLocale="ja-JP" label="First day of 元亨"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1324/12/16'})} calendarLocale="ja-JP" label="Last day of 元亨"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1324/12/17'})} calendarLocale="ja-JP" label="First day of 正中"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1326/05/03'})} calendarLocale="ja-JP" label="Last day of 正中"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1326/05/04'})} calendarLocale="ja-JP" label="First day of 嘉暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1329/09/05'})} calendarLocale="ja-JP" label="Last day of 嘉暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1329/09/06'})} calendarLocale="ja-JP" label="First day of 元徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1331/08/16'})} calendarLocale="ja-JP" label="Last day of 元徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1331/08/17'})} calendarLocale="ja-JP" label="First day of 元弘"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1334/02/05'})} calendarLocale="ja-JP" label="Last day of 元弘"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1334/02/06'})} calendarLocale="ja-JP" label="First day of 建武"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1336/03/07'})} calendarLocale="ja-JP" label="Last day of 建武"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1336/03/08'})} calendarLocale="ja-JP" label="First day of 延元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1340/05/05'})} calendarLocale="ja-JP" label="Last day of 延元"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1340/05/06'})} calendarLocale="ja-JP" label="First day of 興国"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1346/12/15'})} calendarLocale="ja-JP" label="Last day of 興国"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1346/12/16'})} calendarLocale="ja-JP" label="First day of 正平"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1370/07/31'})} calendarLocale="ja-JP" label="Last day of 正平"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1370/08/01'})} calendarLocale="ja-JP" label="First day of 建徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1372/04/08'})} calendarLocale="ja-JP" label="Last day of 建徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1372/04/09'})} calendarLocale="ja-JP" label="First day of 文中"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1375/06/03'})} calendarLocale="ja-JP" label="Last day of 文中"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1375/06/04'})} calendarLocale="ja-JP" label="First day of 天授"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1379/03/29'})} calendarLocale="ja-JP" label="Last day of 天授"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1379/03/30'})} calendarLocale="ja-JP" label="First day of 康暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1381/02/17'})} calendarLocale="ja-JP" label="Last day of 康暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1381/02/18'})} calendarLocale="ja-JP" label="First day of 弘和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1384/05/05'})} calendarLocale="ja-JP" label="Last day of 弘和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1384/05/06'})} calendarLocale="ja-JP" label="First day of 元中"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1387/08/29'})} calendarLocale="ja-JP" label="Last day of 元中"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1387/08/30'})} calendarLocale="ja-JP" label="First day of 至徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1387/08/30'})} calendarLocale="ja-JP" label="Last day of 至徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1387/08/31'})} calendarLocale="ja-JP" label="First day of 嘉慶"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1389/02/16'})} calendarLocale="ja-JP" label="Last day of 嘉慶"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1389/02/17'})} calendarLocale="ja-JP" label="First day of 康応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1390/04/02'})} calendarLocale="ja-JP" label="Last day of 康応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1390/04/03'})} calendarLocale="ja-JP" label="First day of 明徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1394/07/12'})} calendarLocale="ja-JP" label="Last day of 明徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1394/07/13'})} calendarLocale="ja-JP" label="First day of 応永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1428/05/05'})} calendarLocale="ja-JP" label="Last day of 応永"/>
	</HxGrid>
};

// --- 15th century (正長 ~ 明応) ---

export const JaJapanese15th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1428/05/06'})} calendarLocale="ja-JP" label="First day of 正長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1429/09/13'})} calendarLocale="ja-JP" label="Last day of 正長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1429/09/14'})} calendarLocale="ja-JP" label="First day of 永享"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1441/02/25'})} calendarLocale="ja-JP" label="Last day of 永享"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1441/02/26'})} calendarLocale="ja-JP" label="First day of 嘉吉"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1444/02/13'})} calendarLocale="ja-JP" label="Last day of 嘉吉"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1444/02/14'})} calendarLocale="ja-JP" label="First day of 文安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1449/08/05'})} calendarLocale="ja-JP" label="Last day of 文安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1449/08/06'})} calendarLocale="ja-JP" label="First day of 宝徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1452/08/02'})} calendarLocale="ja-JP" label="Last day of 宝徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1452/08/03'})} calendarLocale="ja-JP" label="First day of 享徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1455/08/02'})} calendarLocale="ja-JP" label="Last day of 享徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1455/08/03'})} calendarLocale="ja-JP" label="First day of 康正"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1457/10/06'})} calendarLocale="ja-JP" label="Last day of 康正"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1457/10/07'})} calendarLocale="ja-JP" label="First day of 長禄"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1460/12/29'})} calendarLocale="ja-JP" label="Last day of 長禄"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1460/12/30'})} calendarLocale="ja-JP" label="First day of 寛正"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1466/03/08'})} calendarLocale="ja-JP" label="Last day of 寛正"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1466/03/09'})} calendarLocale="ja-JP" label="First day of 文正"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1467/03/11'})} calendarLocale="ja-JP" label="Last day of 文正"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1467/03/12'})} calendarLocale="ja-JP" label="First day of 応仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1469/05/06'})} calendarLocale="ja-JP" label="Last day of 応仁"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1469/05/07'})} calendarLocale="ja-JP" label="First day of 文明"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1487/08/06'})} calendarLocale="ja-JP" label="Last day of 文明"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1487/08/07'})} calendarLocale="ja-JP" label="First day of 長享"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1489/08/29'})} calendarLocale="ja-JP" label="Last day of 長享"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1489/08/30'})} calendarLocale="ja-JP" label="First day of 延徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1492/07/27'})} calendarLocale="ja-JP" label="Last day of 延徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1492/07/28'})} calendarLocale="ja-JP" label="First day of 明応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1501/03/10'})} calendarLocale="ja-JP" label="Last day of 明応"/>
	</HxGrid>
};

// --- 16th century (文亀 ~ 慶長) ---

export const JaJapanese16th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1501/03/11'})} calendarLocale="ja-JP" label="First day of 文亀"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1504/03/10'})} calendarLocale="ja-JP" label="Last day of 文亀"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1504/03/11'})} calendarLocale="ja-JP" label="First day of 永正"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1521/09/01'})} calendarLocale="ja-JP" label="Last day of 永正"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1521/09/02'})} calendarLocale="ja-JP" label="First day of 大永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1528/08/29'})} calendarLocale="ja-JP" label="Last day of 大永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1528/08/30'})} calendarLocale="ja-JP" label="First day of 享禄"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1532/08/07'})} calendarLocale="ja-JP" label="Last day of 享禄"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1532/08/08'})} calendarLocale="ja-JP" label="First day of 天文"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1555/11/01'})} calendarLocale="ja-JP" label="Last day of 天文"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1555/11/02'})} calendarLocale="ja-JP" label="First day of 弘治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1558/03/09'})} calendarLocale="ja-JP" label="Last day of 弘治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1558/03/10'})} calendarLocale="ja-JP" label="First day of 永禄"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1570/05/02'})} calendarLocale="ja-JP" label="Last day of 永禄"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1570/05/03'})} calendarLocale="ja-JP" label="First day of 元亀"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1573/08/06'})} calendarLocale="ja-JP" label="Last day of 元亀"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1573/08/07'})} calendarLocale="ja-JP" label="First day of 天正"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1592/12/07'})} calendarLocale="ja-JP" label="Last day of 天正"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1592/12/08'})} calendarLocale="ja-JP" label="First day of 文禄"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1596/10/26'})} calendarLocale="ja-JP" label="Last day of 文禄"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1596/10/27'})} calendarLocale="ja-JP" label="First day of 慶長"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1615/07/12'})} calendarLocale="ja-JP" label="Last day of 慶長"/>
	</HxGrid>
};

// --- 17th century (元和 ~ 元禄) ---

export const JaJapanese17th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1615/07/13'})} calendarLocale="ja-JP" label="First day of 元和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1624/02/29'})} calendarLocale="ja-JP" label="Last day of 元和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1624/03/01'})} calendarLocale="ja-JP" label="First day of 寛永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1644/12/15'})} calendarLocale="ja-JP" label="Last day of 寛永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1644/12/16'})} calendarLocale="ja-JP" label="First day of 正保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1648/02/14'})} calendarLocale="ja-JP" label="Last day of 正保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1648/02/15'})} calendarLocale="ja-JP" label="First day of 慶安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1652/09/17'})} calendarLocale="ja-JP" label="Last day of 慶安"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1652/09/18'})} calendarLocale="ja-JP" label="First day of 承応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1655/04/12'})} calendarLocale="ja-JP" label="Last day of 承応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1655/04/13'})} calendarLocale="ja-JP" label="First day of 明暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1658/07/22'})} calendarLocale="ja-JP" label="Last day of 明暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1658/07/23'})} calendarLocale="ja-JP" label="First day of 万治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1661/04/24'})} calendarLocale="ja-JP" label="Last day of 万治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1661/04/25'})} calendarLocale="ja-JP" label="First day of 寛文"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1673/09/20'})} calendarLocale="ja-JP" label="Last day of 寛文"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1673/09/21'})} calendarLocale="ja-JP" label="First day of 延宝"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1681/09/28'})} calendarLocale="ja-JP" label="Last day of 延宝"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1681/09/29'})} calendarLocale="ja-JP" label="First day of 天和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1684/02/20'})} calendarLocale="ja-JP" label="Last day of 天和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1684/02/21'})} calendarLocale="ja-JP" label="First day of 貞享"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1688/09/29'})} calendarLocale="ja-JP" label="Last day of 貞享"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1688/09/30'})} calendarLocale="ja-JP" label="First day of 元禄"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1704/03/12'})} calendarLocale="ja-JP" label="Last day of 元禄"/>
	</HxGrid>
};

// --- 18th century (宝永 ~ 寛政) ---

export const JaJapanese18th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1704/03/13'})} calendarLocale="ja-JP" label="First day of 宝永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1711/04/24'})} calendarLocale="ja-JP" label="Last day of 宝永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1711/04/25'})} calendarLocale="ja-JP" label="First day of 正徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1716/06/21'})} calendarLocale="ja-JP" label="Last day of 正徳"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1716/06/22'})} calendarLocale="ja-JP" label="First day of 享保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1736/04/27'})} calendarLocale="ja-JP" label="Last day of 享保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1736/04/28'})} calendarLocale="ja-JP" label="First day of 元文"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1741/02/26'})} calendarLocale="ja-JP" label="Last day of 元文"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1741/02/27'})} calendarLocale="ja-JP" label="First day of 寛保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1744/02/20'})} calendarLocale="ja-JP" label="Last day of 寛保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1744/02/21'})} calendarLocale="ja-JP" label="First day of 延享"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1748/07/11'})} calendarLocale="ja-JP" label="Last day of 延享"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1748/07/12'})} calendarLocale="ja-JP" label="First day of 寛延"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1751/10/26'})} calendarLocale="ja-JP" label="Last day of 寛延"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1751/10/27'})} calendarLocale="ja-JP" label="First day of 宝暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1764/06/01'})} calendarLocale="ja-JP" label="Last day of 宝暦"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1764/06/02'})} calendarLocale="ja-JP" label="First day of 明和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1772/11/15'})} calendarLocale="ja-JP" label="Last day of 明和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1772/11/16'})} calendarLocale="ja-JP" label="First day of 安永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1781/04/01'})} calendarLocale="ja-JP" label="Last day of 安永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1781/04/02'})} calendarLocale="ja-JP" label="First day of 天明"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1789/01/24'})} calendarLocale="ja-JP" label="Last day of 天明"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1789/01/25'})} calendarLocale="ja-JP" label="First day of 寛政"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1801/02/04'})} calendarLocale="ja-JP" label="Last day of 寛政"/>
	</HxGrid>
};

// --- 19th century (享和 ~ 明治) ---

export const JaJapanese19th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1801/02/05'})} calendarLocale="ja-JP" label="First day of 享和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1804/02/10'})} calendarLocale="ja-JP" label="Last day of 享和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1804/02/11'})} calendarLocale="ja-JP" label="First day of 文化"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1818/04/21'})} calendarLocale="ja-JP" label="Last day of 文化"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1818/04/22'})} calendarLocale="ja-JP" label="First day of 文政"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1830/12/09'})} calendarLocale="ja-JP" label="Last day of 文政"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1830/12/10'})} calendarLocale="ja-JP" label="First day of 天保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1844/12/01'})} calendarLocale="ja-JP" label="Last day of 天保"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1844/12/02'})} calendarLocale="ja-JP" label="First day of 弘化"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1848/02/27'})} calendarLocale="ja-JP" label="Last day of 弘化"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1848/02/28'})} calendarLocale="ja-JP" label="First day of 嘉永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1854/11/26'})} calendarLocale="ja-JP" label="Last day of 嘉永"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1854/11/27'})} calendarLocale="ja-JP" label="First day of 安政"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1860/03/17'})} calendarLocale="ja-JP" label="Last day of 安政"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1860/03/18'})} calendarLocale="ja-JP" label="First day of 万延"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1861/02/18'})} calendarLocale="ja-JP" label="Last day of 万延"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1861/02/19'})} calendarLocale="ja-JP" label="First day of 文久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1864/02/19'})} calendarLocale="ja-JP" label="Last day of 文久"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1864/02/20'})} calendarLocale="ja-JP" label="First day of 元治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1865/04/06'})} calendarLocale="ja-JP" label="Last day of 元治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1865/04/07'})} calendarLocale="ja-JP" label="First day of 慶応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1868/10/22'})} calendarLocale="ja-JP" label="Last day of 慶応"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1868/10/23'})} calendarLocale="ja-JP" label="First day of 明治"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1912/07/29'})} calendarLocale="ja-JP" label="Last day of 明治"/>
	</HxGrid>
};

// --- 20th century (大正 ~ 平成) ---

export const JaJapanese20th: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1912/07/30'})} calendarLocale="ja-JP" label="First day of 大正"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1926/12/24'})} calendarLocale="ja-JP" label="Last day of 大正"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1926/12/25'})} calendarLocale="ja-JP" label="First day of 昭和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1989/01/07'})} calendarLocale="ja-JP" label="Last day of 昭和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '1989/01/08'})} calendarLocale="ja-JP" label="First day of 平成"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2019/04/30'})} calendarLocale="ja-JP" label="Last day of 平成"/>
	</HxGrid>
};

// --- 21st century (令和) ---

export const JaJapanese21st: Story = {
	render: (args) => <HxGrid gapX="lg" gapY="lg">
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2019/05/01'})} calendarLocale="ja-JP" label="First day of 令和"/>
		<LocaleStoryForDateOnly {...args} $model={ERO.reactive({date: '2026/07/21'})} calendarLocale="ja-JP" label="Someday 2026 (令和 8)"/>
	</HxGrid>
};
