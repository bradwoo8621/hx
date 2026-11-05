import type {ReactNode} from 'react';
import type {HxTableFilterMethod} from './types';

/** i18n key or React node for each filter method label */
export interface HxTableFilterMethodLabels {
	match: ReactNode;
	unmatch: ReactNode;
	and: ReactNode;
	or: ReactNode;
}

/** Label shown for a filter method */
export const filterMethodLabel = (method: HxTableFilterMethod | undefined, labels: HxTableFilterMethodLabels): ReactNode => {
	switch (method) {
		case 'unmatch':
			return labels.unmatch;
		case 'and':
			return labels.and;
		case 'or':
			return labels.or;
		case 'match':
		default:
			return labels.match;
	}
};

/** Display text of a filter criteria value, array values are shown as an interval */
export const filterValueText = (value: unknown): string => {
	if (Array.isArray(value)) {
		return value.join(' ~ ');
	}
	return value == null ? '' : `${value}`;
};
