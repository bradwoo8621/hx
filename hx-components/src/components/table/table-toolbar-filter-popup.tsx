import type {HxTableProps} from './types';

export type HxTableToolbarFilterPopupProps<T extends object, PT extends object = T> =
	& Required<
	Pick<
		HxTableProps<T, PT>,
		| 'filterColumns'
		| 'filterMatchKey' | 'filterNotMatchKey' | 'filterBetweenKey' | 'filterNotBetweenKey'
		| 'filterPopupConfirmKey' | 'filterPopupCancelKey'
	>>;

export const EvtHxTable_CloseFilterPopup = 'evt-hx-table--close-filter-popup';

export const HxTableToolbarFilterPopup =
	<T extends object, PT extends object = T>(props: HxTableToolbarFilterPopupProps<T, PT>) => {
		console.log(props);

		return <div>

		</div>;
	};
