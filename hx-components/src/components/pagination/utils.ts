import type {WithRequired} from '../../types';
import type {HxPaginationData} from './types.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const computePaginationData = (data?: any, defaultPageSize?: number): WithRequired<HxPaginationData, 'totalPages'> => {
	if (data == null) {
		return {
			pageNumber: 1,
			pageSize: defaultPageSize,
			totalPages: 1
		};
	}

	const {pageNumber, pageSize, totalPages, totalItems} = data;
	const computed = {
		pageNumber: pageNumber ?? 1,
		pageSize: pageSize ?? defaultPageSize,
		totalPages: totalPages ?? 1,
		totalItems
	};

	Object.keys(computed).forEach((key) => {
		// @ts-expect-error ignore type check
		const value = computed[key];
		if (value != null) {
			// @ts-expect-error ignore type check
			computed[key] = Number(value);
		}
	});

	return computed;
};
