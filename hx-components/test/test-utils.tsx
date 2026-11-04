import {render, type RenderOptions, type RenderResult} from '@testing-library/react';
import type {ReactElement} from 'react';
import {HxContextProvider} from '../src';

/**
 * Render a component inside the hx context provider, which every hx component
 * needs for language, theme, overlay and tooltip services.
 */
export const renderWithProvider = (
	ui: ReactElement,
	options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
	return render(ui, {wrapper: HxContextProvider, ...options});
};

/**
 * Find the single element carrying the given data attribute marker.
 */
export const queryByDataAttr = (container: HTMLElement, attr: string): HTMLElement | null => {
	return container.querySelector<HTMLElement>(`[${attr}]`);
};
