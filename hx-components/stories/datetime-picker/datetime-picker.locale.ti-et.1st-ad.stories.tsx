import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {baseMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

export default {title: 'Components/Basic/DateTimePicker/Locale/Ethiopic/FirstAD/Tigrinya', ...baseMeta};

export const TiEtFirstAD: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} calendarLocale="ti-ET"
			             label="#1 Month of A.D. — ti-ET (Ethiopic, 5493/05/08)"/>
		</HxGrid>;
	}
};
