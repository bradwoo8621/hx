import type {WithRequired} from '../../types';
import type {HxPaginationData} from './types.ts';

/**
 * Processes and normalizes pagination data from arbitrary input formats
 * Ensures all required pagination fields have valid numeric values with appropriate defaults
 * @param data - Raw pagination data (can be partial or from non-standard structures)
 * @param defaultPageSize - Default page size to use when not specified in input data
 * @returns Normalized pagination data with guaranteed totalPages field
 */
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

	// Convert all numeric values to proper Number type to handle string inputs
	Object.keys(computed).forEach((key) => {
		// @ts-expect-error ignore type check for dynamic property access
		const value = computed[key];
		if (value != null) {
			// @ts-expect-error ignore type check for dynamic property assignment
			computed[key] = Number(value);
		}
	});

	return computed;
};
