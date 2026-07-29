import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid, HxSeparator} from '../../src';
import {createMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

const meta = createMeta('Components/Basic/DateTimePicker/Locale/Buddhist/1582');
export default meta;

export const ThBuddhist1582: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/01/01'})} forceLang="th-TH"
			             label="Last year has Gregorian reform dates — th-TH"/>
			<HxSeparator gCols={12}/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/14'})} forceLang="th-TH"
			             label="Short months, aligned with Gregorian dates, #1 — th-TH"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/10/15'})} forceLang="th-TH"
			             label="Short months, aligned with Gregorian dates, #2 — th-TH"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1582/12/31'})} forceLang="th-TH"
			             label="Fully aligned with Gregorian dates — th-TH"/>
		</HxGrid>;
	}
};
