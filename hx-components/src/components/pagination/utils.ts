import {ERO} from '@hx/data';
import type {HxContext} from '../../contexts';
import type {WithRequired} from '../../types';
import {HxConsole} from '../../utils';
import type {HxPaginationData, HxPaginationProps} from './types';

/**
 * Processes and normalizes pagination data from arbitrary input formats.
 * Ensures all required pagination fields have valid numeric values with appropriate defaults.
 *
 * @param data - Raw pagination data (can be partial or from non-standard structures)
 * @param defaultPageSize - Default page size to use when not specified in input data
 * @returns Normalized pagination data with guaranteed totalPages field
 */
const computePaginationData = (
	data: Partial<HxPaginationData>, defaultPageSize: number
): WithRequired<HxPaginationData, 'pageSize' | 'totalPages'> => {
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

export const readPaginationData = <T extends object>(
	options: Pick<HxPaginationProps<T>, '$model' | '$field' | 'read'> & WithRequired<HxPaginationProps<T>, 'allowedPageSizes'>,
	context: HxContext
): WithRequired<HxPaginationData, 'pageSize' | 'totalPages'> => {
	const {$model, $field, read, allowedPageSizes} = options;

	let value;
	if ($field != null && $field.length != 0) {
		value = ERO.getValue($model, $field);
	} else {
		value = $model;
	}
	const formattedValue: Partial<HxPaginationData> = read != null ? read($model, value, context) : value;
	return computePaginationData(formattedValue, allowedPageSizes[0]);
};

export const writePaginationData = <T extends object>(
	data: HxPaginationData,
	options: Pick<HxPaginationProps<T>, '$model' | '$field' | 'write'> & WithRequired<HxPaginationProps<T>, 'allowedPageSizes'>,
	context: HxContext
): void => {
	const {$model, $field, write, allowedPageSizes} = options;

	data = computePaginationData(data, allowedPageSizes[0]);
	if (write != null) {
		write($model, data, context);
	} else if ($field != null && $field.length !== 0) {
		const obj = ERO.getValue($model, $field);
		if (obj == null) {
			ERO.setValueSilent($model, $field, data, 'mute-all');
		} else {
			// mute property settings by revoke
			const exists = ERO.revoke<HxPaginationData>(obj);
			exists.pageNumber = data.pageNumber;
			exists.pageSize = data.pageSize;
			exists.totalPages = data.totalPages;
			exists.totalItems = data.totalItems;
		}
	} else {
		HxConsole.error('Neither write function nor $field provided, write pagination data ignored.');
	}
};
