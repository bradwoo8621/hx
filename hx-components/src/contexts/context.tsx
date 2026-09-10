// @ts-expect-error import React
import React, {type DispatchWithoutAction, type ReactNode, useEffect, useState} from 'react';
import {useForceUpdate} from '../hooks';
import {HxContextDefaults} from './defaults.ts';
import {DiscreetHxLanguageContext, HxLanguageProvider, type HxReactLanguageContext, useHxLanguage} from './language';
import {
	DiscreetHxOverlayContext,
	type HxOverlayContext,
	type HxOverlayInstanceContext,
	HxOverlayProvider,
	useHxOverlay,
	useHxOverlayInstance
} from './overlay';
import {DiscreetHxThemeContext, type HxReactThemeContext, HxThemeProvider, useHxTheme} from './theme';

export interface HxContextProviderProps {
	resetHtmlStyles?: boolean;
	resetBodyStyles?: boolean;
	children: ReactNode;
}

type HxGlobalResetProps = Omit<HxContextProviderProps, 'children'>;

const resetGlobal = (options: HxGlobalResetProps): HxGlobalResetProps => {
	if (options.resetHtmlStyles ?? HxContextDefaults.resetHtmlStyles) {
		document.documentElement.setAttribute('data-hx-reset-styles', '');
	} else {
		document.documentElement.removeAttribute('data-hx-reset-styles');
	}
	if (options.resetBodyStyles ?? HxContextDefaults.resetBodyStyles) {
		document.body.setAttribute('data-hx-reset-styles', '');
	} else {
		document.body.removeAttribute('data-hx-reset-styles');
	}

	return {...options};
};

const HxGlobalReset = (props: HxGlobalResetProps) => {
	const [state, setState] = useState(resetGlobal(props));
	useEffect(() => {
		const changed = Object.keys(props).some(key => {
			return state[key as keyof HxGlobalResetProps] != props[key as keyof HxGlobalResetProps];
		});
		if (changed) {
			(async () => {
				setState(resetGlobal(props));
			})();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.resetHtmlStyles, props.resetBodyStyles, state]);

	return (void 0);
};

export const HxContextProvider = (props: HxContextProviderProps) => {
	const {children, ...rest} = props;

	return <HxThemeProvider>
		<HxGlobalReset {...rest}/>
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
	/* undefined when not in an overlay instance */
	overlayInstance?: HxOverlayInstanceContext;
	forceUpdate: DispatchWithoutAction;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useHxContext = (): HxContext => {
	const theme = useHxTheme();
	const language = useHxLanguage();
	const overlay = useHxOverlay();
	const overlayInstance = useHxOverlayInstance();
	const forceUpdate = useForceUpdate();

	const [context] = useState<HxContext>({
		theme: theme ?? new DiscreetHxThemeContext(),
		language: language ?? new DiscreetHxLanguageContext(),
		overlay: overlay ?? new DiscreetHxOverlayContext(),
		overlayInstance,
		forceUpdate
	});

	return context;
};
