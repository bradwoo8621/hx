// @ts-expect-error import React
import React from 'react';
import type {HxActionsColor, HxActionsTailing, HxActionVarious, HxExtActionsProps} from './types';

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
			$model
			// tailing,
			// visible
		} = props;

		console.log($model);

		// const context = useHxContext();
		// const popupContext = useHxPopupContext();

		return <></>;
	};
