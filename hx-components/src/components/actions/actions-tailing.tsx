// @ts-expect-error import React
import React from 'react';
import {useHxPopupContext} from '../popup';
import {buildContent} from './actions-builder.tsx';
import {
	EvtHxActions_ClosePopup,
	type HxActionsColor,
	type HxActionsTailing,
	type HxActionVarious,
	type HxExtActionsProps
} from './types';

export type HxActionsTailingProps<T extends object> =
	& Pick<HxExtActionsProps<T>, '$model'>
	& {
	color: HxActionsColor;
	various: HxActionVarious;
	tailing: HxActionsTailing;
	/** Whether the popup is visible */
	visible: boolean
};

export const HxActionsTailingContent =
	<T extends object>(props: HxActionsTailingProps<T>) => {
		const {
			$model,
			color, various,
			tailing,
			visible
		} = props;

		// const context = useHxContext();
		const popupContext = useHxPopupContext();

		if (!visible) {
			return null;
		}

		const closePopup = () => {
			popupContext.emit(EvtHxActions_ClosePopup);
		};

		const content = buildContent({
			actions: tailing,
			$model, disabled: false, color, various,
			openPopup: () => {
			},
			closePopup
		});

		return <>
			{content}
		</>;
	};
