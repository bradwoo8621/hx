// @ts-expect-error import React
import React from 'react';
import {HxButton} from '../button';
import {Filter} from '../icons';
import {HxPopupProvider} from '../popup';
import {
	EvtHxTable_CloseFilterPopup,
	HxTableToolbarFilterPopup,
	type HxTableToolbarFilterPopupProps
} from './table-toolbar-filter-popup';
import type {HxTableProps} from './types';
import {useHxTableToolbarPopupTrigger} from './use-table-toolbar-popup-trigger';

export type HxTableToolbarFilterButtonProps<T extends object, PT extends object = T> =
	& Pick<
		HxTableProps<T, PT>,
		| 'filterPopupZIndex' | 'filterPopupGapToEdge'
	>
	& Required<
	Pick<
		HxTableProps<T, PT>,
		| 'filterColumns'
		| 'filterMatchKey' | 'filterNotMatchKey' | 'filterBetweenKey' | 'filterNotBetweenKey'
		| 'noFilterColumnKey' | 'addToFilterKey' | 'noMoreFilterColumnKey'
		| 'filterPopupConfirmKey' | 'filterPopupCancelKey' | 'filterPopupClearKey'
	>>;

const Trigger = () => {
	const {onClick, ref} = useHxTableToolbarPopupTrigger({closeEvent: EvtHxTable_CloseFilterPopup});

	return <HxButton variant="ghost" text={<Filter/>}
	                 data-hx-button-svg-icon="" data-hx-table-toolbar-button="filter"
	                 onClick={onClick}
	                 ref={ref}/>;
};

export const HxTableToolbarFilterButton =
	<T extends object, PT extends object = T>(props: HxTableToolbarFilterButtonProps<T, PT>) => {
		const {
			filterColumns,
			filterPopupZIndex, filterPopupGapToEdge,
			filterMatchKey, filterNotMatchKey, filterBetweenKey, filterNotBetweenKey,
			noFilterColumnKey, addToFilterKey, noMoreFilterColumnKey,
			filterPopupConfirmKey, filterPopupCancelKey, filterPopupClearKey
		} = props;

		const popupProps: HxTableToolbarFilterPopupProps<T, PT> = {
			filterColumns,
			filterMatchKey, filterNotMatchKey, filterBetweenKey, filterNotBetweenKey,
			noFilterColumnKey, addToFilterKey, noMoreFilterColumnKey,
			filterPopupConfirmKey, filterPopupCancelKey, filterPopupClearKey
		};

		return <HxPopupProvider
			zIndex={filterPopupZIndex} gapToEdge={filterPopupGapToEdge} sameWidthAtMinimum={true}
			data-hx-popup-for-table-filter=""
			trigger={<Trigger/>}>
			<HxTableToolbarFilterPopup {...popupProps}/>
		</HxPopupProvider>;
	};
