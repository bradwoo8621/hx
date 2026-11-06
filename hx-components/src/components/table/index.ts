export * from './types';
export {configHxTable, type HxTableSettings} from './defaults';
export {HxTable, type HxTableType} from './table';

// TODO table toolbar:
//  - fuzzy search: the input is not wired to fuzzyChange yet
//  - sort/filter: the entry buttons have no criteria dialogs, and nothing emits sortOrFilterChanged yet
// TODO table row operations:
//  - add/remove row
