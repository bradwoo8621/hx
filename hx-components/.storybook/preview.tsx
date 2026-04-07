import type {Preview} from '@storybook/react-vite';
import '../src/styles/index.css';
// @ts-expect-error import react
import React from 'react';
import {HxConsole, HxContextProvider, HxI18NDefaults, StdHxLanguages} from '../src';

StdHxLanguages.install('en', HxI18NDefaults);

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},

		a11y: {
			// 't odo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: 'todo'
		}
	},
	decorators: [
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		(Story, _) => {
			HxConsole.debugEnabled = true;
			HxConsole.logEnabled = true;
			return <HxContextProvider>
				<Story/>
			</HxContextProvider>;
		}
	]
};

export default preview;