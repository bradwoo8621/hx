import type {HxGap} from '../../types';

/**
 * Global configuration settings for HxPagination components
 * Can be used to set default behavior across all pagination instances
 */
export interface HxPaginationSettings {
	/** Default horizontal gap between columns */
	gapX?: HxGap;
	/** Default list of allowed page size options for the page size selector */
	allowedPageSizes?: Array<number>;
	/** Whether to show page size information even when only one page size is available */
	showPageSize?: boolean;
	/** i18n key rendered after the page size number, default `~HxCommon.PerPage` */
	perPageKey?: string;
	/** i18n key rendered before the total item count, default `~HxCommon.TotalItems1` */
	totalItemsKey1?: string;
	/** i18n key rendered after the total item count, default `~HxCommon.TotalItems2` */
	totalItemsKey2?: string;
}

/**
 * Default values for pagination configuration settings
 * These values are used when no explicit props are provided to HxPagination components
 */
export const HxPaginationDefaults: Required<HxPaginationSettings> = {
	gapX: 'xs',
	allowedPageSizes: [20],
	showPageSize: false,
	perPageKey: '~HxCommon.PerPage',
	totalItemsKey1: '~HxCommon.TotalItems1',
	totalItemsKey2: '~HxCommon.TotalItems2'
};

/**
 * Configure global default settings for all HxPagination components
 * @param settings - Partial settings object to override default values
 */
export const configHxPagination = (settings: HxPaginationSettings) => {
	HxPaginationDefaults.gapX = settings.gapX?.trim() as HxGap || HxPaginationDefaults.gapX;
	HxPaginationDefaults.allowedPageSizes = settings.allowedPageSizes ?? HxPaginationDefaults.allowedPageSizes;
	HxPaginationDefaults.showPageSize = settings.showPageSize ?? HxPaginationDefaults.showPageSize;
	HxPaginationDefaults.perPageKey = settings.perPageKey?.trim() || HxPaginationDefaults.perPageKey;
	HxPaginationDefaults.totalItemsKey1 = settings.totalItemsKey1?.trim() || HxPaginationDefaults.totalItemsKey1;
	HxPaginationDefaults.totalItemsKey2 = settings.totalItemsKey2?.trim() || HxPaginationDefaults.totalItemsKey2;
};
