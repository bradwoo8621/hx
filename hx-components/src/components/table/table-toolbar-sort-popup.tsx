import type {HxTableProps} from './types';

export type HxTableToolbarSortPopupProps<T extends object, PT extends object = T> =
	& Required<
	Pick<
		HxTableProps<T, PT>,
		| 'sortColumns'
		| 'sortAscKey' | 'sortDescKey'
		| 'sortPopupConfirmKey' | 'sortPopupCancelKey'
	>>;

export const EvtHxTable_CloseSortPopup = 'evt-hx-table--close-sort-popup';

export const HxTableToolbarSortPopup =
	<T extends object, PT extends object = T>(props: HxTableToolbarSortPopupProps<T, PT>) => {
		console.log(props);

		return <div>

		</div>;
	};
