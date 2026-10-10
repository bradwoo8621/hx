import type {Preview} from '@storybook/react-vite';
import '../src/styles/index.css';
// @ts-expect-error import react
import React, {useEffect} from 'react';
import {HxConsole, HxContextProvider, HxI18NDefaults, StdHxLanguages} from '../src';

StdHxLanguages.install('en', HxI18NDefaults);

const preview: Preview = {
	globalTypes: {
		direction: {
			description: 'Writing direction of the story canvas',
			toolbar: {
				title: 'Direction',
				items: [
					{value: 'ltr', title: 'LTR'},
					{value: 'rtl', title: 'RTL'}
				],
				dynamicTitle: true
			}
		}
	},
	initialGlobals: {
		direction: 'ltr'
	},
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
		(Story, context) => {
			useEffect(() => {
				document.documentElement.dir = context.globals.direction;
			}, [context.globals.direction]);

			HxConsole.debugEnabled = true;
			HxConsole.logEnabled = true;
			return <HxContextProvider>
				<Story/>
			</HxContextProvider>;
		}
	]
};

export default preview;