import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {createMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

const meta = createMeta('Components/Basic/DateTimePicker/Locale/Gregory');
export default meta;

// ---------------------------------------------------------------------------
// Gregorian calendar
// ---------------------------------------------------------------------------

export const Gregory: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg" minWidth={800}>
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} forceLang="gregory"
			             label="#1 Month of A.D."/>
			<div/>
			<LocaleStory {...args} $model={ERO.reactive({date: '1980/01/01'})} forceLang="gregory"
			             label="New Year's Day, some year, 20th century"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '2026/07/21'})} forceLang="gregory"
			             label="Someday 2026"/>
		</HxGrid>;
	}
};
