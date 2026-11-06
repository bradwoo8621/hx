// @ts-expect-error import React
import React from 'react';
import {HxButton} from '../button';
import {Sort} from '../icons';
import {HxPopupProvider} from '../popup';
import {
	EvtHxTable_CloseSortPopup,
	HxTableToolbarSortPopup,
	type HxTableToolbarSortPopupProps
} from './table-toolbar-sort-popup';
import type {HxTableProps} from './types';
import {useHxTableToolbarPopupTrigger} from './use-table-toolbar-popup-trigger';

export type HxTableToolbarSortButtonProps<T extends object, PT extends object = T> =
	& Pick<
		HxTableProps<T, PT>,
		| 'sortPopupZIndex' | 'sortPopupGapToEdge'
	>
	& Required<
	Pick<
		HxTableProps<T, PT>,
		| 'sortColumns'
		| 'sortAscKey' | 'sortDescKey'
		| 'sortPopupConfirmKey' | 'sortPopupCancelKey'
	>>;

const Trigger = () => {
	const {onClick, ref} = useHxTableToolbarPopupTrigger({closeEvent: EvtHxTable_CloseSortPopup});

	return <HxButton variant="ghost" text={<Sort/>}
	                 data-hx-button-svg-icon="" data-hx-table-toolbar-button="sort"
	                 onClick={onClick}
	                 ref={ref}/>;
};

export const HxTableToolbarSortButton =
	<T extends object, PT extends object = T>(props: HxTableToolbarSortButtonProps<T, PT>) => {
		const {
			sortColumns,
			sortPopupZIndex, sortPopupGapToEdge,
			sortAscKey, sortDescKey, sortPopupConfirmKey, sortPopupCancelKey
		} = props;

		const popupProps: HxTableToolbarSortPopupProps<T, PT> = {
			sortColumns,
			sortAscKey, sortDescKey, sortPopupConfirmKey, sortPopupCancelKey
		};

		return <HxPopupProvider
			zIndex={sortPopupZIndex} gapToEdge={sortPopupGapToEdge} sameWidthAtMinimum={true}
			data-hx-popup-for-table-sort=""
			trigger={<Trigger/>}>
			<HxTableToolbarSortPopup {...popupProps}/>
		</HxPopupProvider>;
	};
