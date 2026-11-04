export * from './types';
export {configHxTable, type HxTableSettings} from './defaults';
export {HxTable, type HxTableType} from './table';

// TODO table toolbar (the only sort/filter entry):
//  - search box: global substring match, applied before pagination
//  - sort popover: column + direction, multi-sort priority, draft + apply
//  - filter popover: column + operator + value, draft + apply
//  - condition bar: sort/filter chips, priority ordinal, overflow +N, remove/clear all
// TODO table row operations:
//  - add/remove row
