import {ERO} from '@hx/data';
// @ts-expect-error import React
import React from 'react';
import {HxGrid} from '../../src';
import {createMeta, type Story, LocaleStory} from './datetime-picker.locale.helpers';

const meta = createMeta('Components/Basic/DateTimePicker/Locale/Japanese/Seireki');
export default meta;

// ---------------------------------------------------------------------------
// Japanese calendar — Seireki (西暦) period before the first named era
// ---------------------------------------------------------------------------

export const JaJapaneseSeireki: Story = {
	render: (args) => {
		return <HxGrid gapX="lg" gapY="lg">
			<LocaleStory {...args} $model={ERO.reactive({date: '0001/01/01'})} forceLang="ja-JP"
			             label="First day of 西暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0645/01/02'})} forceLang="ja-JP"
			             label="Last day before transition out of 西暦"/>
			<LocaleStory {...args} $model={ERO.reactive({date: '0645/01/03'})} forceLang="ja-JP"
			             label="Last day of 西暦"/>
		</HxGrid>;
	}
};
