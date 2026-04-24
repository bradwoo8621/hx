import type {HxButtonColor, HxButtonVarious} from '../button';

export interface HxPaginationSettings {
	color?: HxButtonColor;
	various?: HxButtonVarious;
	allowedPageSizes?: Array<number>;
	showPageSize?: boolean;
}

export const HxPaginationDefaults: Required<HxPaginationSettings> = {
	color: 'primary',
	various: 'ghost',
	allowedPageSizes: [20],
	showPageSize: false
};

export const configHxPagination = (settings: HxPaginationSettings) => {
	HxPaginationDefaults.color = settings.color?.trim() as HxButtonColor || HxPaginationDefaults.color;
	HxPaginationDefaults.various = settings.various?.trim() as HxButtonVarious || HxPaginationDefaults.various;
	HxPaginationDefaults.allowedPageSizes = settings.allowedPageSizes ?? HxPaginationDefaults.allowedPageSizes;
	HxPaginationDefaults.showPageSize = settings.showPageSize ?? HxPaginationDefaults.showPageSize;
};
