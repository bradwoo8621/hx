/**
 * Global configuration settings for HxPagination components
 * Can be used to set default behavior across all pagination instances
 */
export interface HxPaginationSettings {
	/** Default list of allowed page size options for the page size selector */
	allowedPageSizes?: Array<number>;
	/** Whether to show page size information even when only one page size is available */
	showPageSize?: boolean;
}

/**
 * Default values for pagination configuration settings
 * These values are used when no explicit props are provided to HxPagination components
 */
export const HxPaginationDefaults: Required<HxPaginationSettings> = {
	allowedPageSizes: [20],
	showPageSize: false
};

/**
 * Configure global default settings for all HxPagination components
 * @param settings - Partial settings object to override default values
 */
export const configHxPagination = (settings: HxPaginationSettings) => {
	HxPaginationDefaults.allowedPageSizes = settings.allowedPageSizes ?? HxPaginationDefaults.allowedPageSizes;
	HxPaginationDefaults.showPageSize = settings.showPageSize ?? HxPaginationDefaults.showPageSize;
};
