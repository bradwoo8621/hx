import type {HxGap} from '../../types';

/**
 * Global configuration settings for HxPagination components
 * Can be used to set default behavior across all pagination instances
 */
export interface HxPaginationSettings {
	/** Default horizontal gap between columns */
	gapX?: HxGap;
	/** Default list of allowed page size options for the page size selector */
	allowedPageSizes?: [number, ...Array<number>];
	/** Whether to show page size information even when only one page size is available */
	showPageSize?: boolean;
	/** i18n key rendered after the page number, default `~HxCommon.OfTotalPages` */
	ofTotalPagesKey?: string;
	/** i18n key rendered after the page size number, default `~HxCommon.PerPage` */
	perPageKey?: string;
	/** i18n key rendered before the total item count, default `~HxCommon.TotalItems1` */
	totalItemsKey1?: string;
	/** i18n key rendered after the total item count, default `~HxCommon.TotalItems2` */
	totalItemsKey2?: string;
	/** i18n key or node rendered between the total item count and page size number, default `~HxCommon.totalComma` */
	totalCommaKey?: string;
}

/**
 * Default values for pagination configuration settings
 * These values are used when no explicit props are provided to HxPagination components
 */
export const HxPaginationDefaults: Required<HxPaginationSettings> = {
	gapX: 'xs',
	allowedPageSizes: [20],
	showPageSize: false,
	ofTotalPagesKey: '~HxCommon.OfTotalPages',
	perPageKey: '~HxCommon.PerPage',
	totalItemsKey1: '~HxCommon.TotalItems1',
	totalItemsKey2: '~HxCommon.TotalItems2',
	totalCommaKey: '~HxCommon.TotalComma'
};

/**
 * Configure global default settings for all HxPagination components
 * @param settings - Partial settings object to override default values
 */
export const configHxPagination = (settings: HxPaginationSettings) => {
	HxPaginationDefaults.gapX = settings.gapX?.trim() as HxGap || HxPaginationDefaults.gapX;
	HxPaginationDefaults.allowedPageSizes = settings.allowedPageSizes ?? HxPaginationDefaults.allowedPageSizes;
	if (HxPaginationDefaults.allowedPageSizes == null || HxPaginationDefaults.allowedPageSizes.length === 0) {
		HxPaginationDefaults.allowedPageSizes = [20];
	}
	HxPaginationDefaults.showPageSize = settings.showPageSize ?? HxPaginationDefaults.showPageSize;
	HxPaginationDefaults.ofTotalPagesKey = settings.ofTotalPagesKey?.trim() || HxPaginationDefaults.ofTotalPagesKey;
	HxPaginationDefaults.perPageKey = settings.perPageKey?.trim() || HxPaginationDefaults.perPageKey;
	HxPaginationDefaults.totalItemsKey1 = settings.totalItemsKey1?.trim() || HxPaginationDefaults.totalItemsKey1;
	HxPaginationDefaults.totalItemsKey2 = settings.totalItemsKey2?.trim() || HxPaginationDefaults.totalItemsKey2;
	HxPaginationDefaults.totalCommaKey = settings.totalCommaKey?.trim() || HxPaginationDefaults.totalCommaKey;
};
