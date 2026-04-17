import type {
	ChangeProps,
	CheckProps,
	CheckResultWithLevel,
	DisabledProps,
	HxComponentDataProps,
	HxDataPath,
	ReadonlyProps,
	VisibleProps,
	WithPartial
} from '../../types';

export type UseDataMonitorOptions<T extends object> =
	& WithPartial<HxComponentDataProps<T>, '$model'>
	& VisibleProps<T>
	& DisabledProps<T>
	& ReadonlyProps<T>
	& ChangeProps<T>;

export interface UseDataMonitorResult {
	visible: boolean;
	disabled: boolean;
	readonly: boolean;
}

export interface DataMonitorState {
	visible: boolean;
	disabled: boolean;
	readonly: boolean;
}

export type CheckPropSuppliedOn = HxDataPath | Array<HxDataPath>;

export type UseCheckMonitorOptions<T extends object> =
	& HxComponentDataProps<T>
	& CheckProps<T>
	& { $supplyOn?: CheckPropSuppliedOn };

export interface UseCheckMonitorResult {
	error?: CheckResultWithLevel;
}

export interface DataCheckState {
	error?: CheckResultWithLevel;
}
