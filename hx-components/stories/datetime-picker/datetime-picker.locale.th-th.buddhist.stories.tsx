import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Buddhist', ...baseMeta};

// ---------------------------------------------------------------------------
// Buddhist calendar — th-TH remaining cases
// (First AD, Julian leap years, and 1582 reform are in common files)
// ---------------------------------------------------------------------------

export const ThBuddhist: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '2000/01/01'})} forceLang="th-TH"
			             label="New Year's Day, B.E. 2543"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2020/01/01'})} forceLang="th-TH"
			             label="New Year's Day, B.E. 2563 (Leap Year)"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} forceLang="th-TH"
			             label="Someday 2026 (B.E. 2569)"/>
		</HxGrid>;
	}
};
