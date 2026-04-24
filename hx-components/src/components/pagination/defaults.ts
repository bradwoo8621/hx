import type {HxPaginationColor, HxPaginationVarious} from './pagination';

export interface HxPaginationSettings {
	color?: HxPaginationColor;
	various?: HxPaginationVarious;
	allowedPageSizes?: Array<number>;
	showPageSize?: boolean;
}

export const HxPaginationDefaults: Required<HxPaginationSettings> = {
	color: 'primary',
	various: 'outline',
	allowedPageSizes: [20],
	showPageSize: false
};

export const configHxPagination = (settings: HxPaginationSettings) => {
	HxPaginationDefaults.color = settings.color?.trim() as HxPaginationColor || HxPaginationDefaults.color;
	HxPaginationDefaults.various = settings.various?.trim() as HxPaginationVarious || HxPaginationDefaults.various;
	HxPaginationDefaults.allowedPageSizes = settings.allowedPageSizes ?? HxPaginationDefaults.allowedPageSizes;
	HxPaginationDefaults.showPageSize = settings.showPageSize ?? HxPaginationDefaults.showPageSize;
};
