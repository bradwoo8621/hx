// @ts-expect-error import React
import React, {type DispatchWithoutAction, type ReactNode, useState} from 'react';
import {useForceUpdate} from '../hooks';
import {DiscreetHxLanguageContext, HxLanguageProvider, type HxReactLanguageContext, useHxLanguage} from './language';
import {DiscreetHxOverlayContext, type HxOverlayContext, HxOverlayProvider, useHxOverlay} from './overlay';
import {DiscreetHxThemeContext, type HxReactThemeContext, HxThemeProvider, useHxTheme} from './theme';

export interface HxContextProviderProps {
	children: ReactNode;
}

export const HxContextProvider = (props: HxContextProviderProps) => {
	const {children} = props;

	return <HxThemeProvider>
		<HxLanguageProvider>
			<HxOverlayProvider>
				<div data-hx-root="">
					{children}
				</div>
			</HxOverlayProvider>
		</HxLanguageProvider>
	</HxThemeProvider>;
};

export interface HxContext {
	theme: HxReactThemeContext;
	language: HxReactLanguageContext;
	overlay: HxOverlayContext;
	forceUpdate: DispatchWithoutAction;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useHxContext = (): HxContext => {
	const theme = useHxTheme();
	const language = useHxLanguage();
	const overlay = useHxOverlay();
	const forceUpdate = useForceUpdate();

	const [context] = useState<HxContext>({
		theme: theme ?? new DiscreetHxThemeContext(),
		language: language ?? new DiscreetHxLanguageContext(),
		overlay: overlay ?? new DiscreetHxOverlayContext(),
		forceUpdate
	});

	return context;
};
