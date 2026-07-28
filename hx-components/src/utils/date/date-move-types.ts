import type {HxDateTimeValue} from '../types';

export type MoveDate = Required<Pick<HxDateTimeValue, 'year' | 'month' | 'day'>>;
