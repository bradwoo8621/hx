export interface HxPaginationSettings {
	allowedPageSizes?: Array<number>;
	showPageSize?: boolean;
}

export const HxPaginationDefaults: Required<HxPaginationSettings> = {
	allowedPageSizes: [20],
	showPageSize: false
};

export const configHxPagination = (settings: HxPaginationSettings) => {
	HxPaginationDefaults.allowedPageSizes = settings.allowedPageSizes ?? HxPaginationDefaults.allowedPageSizes;
	HxPaginationDefaults.showPageSize = settings.showPageSize ?? HxPaginationDefaults.showPageSize;
};
