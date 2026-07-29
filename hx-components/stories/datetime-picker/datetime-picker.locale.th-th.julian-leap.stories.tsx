import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {createMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

const meta = createMeta('Components/Basic/DateTimePicker/Locale/Buddhist/JulianLeap');
export default meta;

export const ThBuddhistJulianLeap: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0100/02/27'})} forceLang="th-TH"
			             label="Julian Leap Year 0100 (B.E. 643)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0200/02/28'})} forceLang="th-TH"
			             label="Julian Leap Year 0200 (B.E. 743)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0300/03/01'})} forceLang="th-TH"
			             label="Julian Leap Year 0300 (B.E. 843)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0500/03/02'})} forceLang="th-TH"
			             label="Julian Leap Year 0500 (B.E. 1043)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0600/03/03'})} forceLang="th-TH"
			             label="Julian Leap Year 0600 (B.E. 1143)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0700/03/04'})} forceLang="th-TH"
			             label="Julian Leap Year 0700 (B.E. 1243)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0900/03/05'})} forceLang="th-TH"
			             label="Julian Leap Year 0900 (B.E. 1443)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1000/03/06'})} forceLang="th-TH"
			             label="Julian Leap Year 1000 (B.E. 1543)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1100/03/07'})} forceLang="th-TH"
			             label="Julian Leap Year 1100 (B.E. 1643)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1300/03/08'})} forceLang="th-TH"
			             label="Julian Leap Year 1300 (B.E. 1843)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1400/03/09'})} forceLang="th-TH"
			             label="Julian Leap Year 1400 (B.E. 1943)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1500/03/10'})} forceLang="th-TH"
			             label="Julian Leap Year 1500 (B.E. 2043)"/>
		</HxGrid>;
	}
};
