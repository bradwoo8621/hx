import type {HxDataPath} from './data';
import type {MonitorFunc} from './monitor-funcs';

export type NextActionOnChange = 'repaint' | null | undefined | void;
export type NextActionsOnChange = NextActionOnChange | Array<NextActionOnChange>;
export type MonitorChangeFunc<T extends object> = MonitorFunc<T, NextActionsOnChange>;

export interface DynamicChange<T extends object> {
	on: HxDataPath | Array<HxDataPath>;
	handle: MonitorChangeFunc<T>;
}

export type ChangePropValue<T extends object> =
	| DynamicChange<T>
	| Array<DynamicChange<T>>;

export interface ChangeProps<T extends object> {
	$change?: ChangePropValue<T>;
}
