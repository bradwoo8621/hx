import type {
	ChangeProps,
	CheckProps,
	CheckResultWithLevel,
	ComponentDataProps,
	DataPath,
	DisabledProps,
	ReadonlyProps,
	VisibleProps
} from '../../types';

export type UseDataMonitorOptions<T extends object> =
	& ComponentDataProps<T>
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

export type CheckPropSuppliedOn = DataPath | Array<DataPath>;

export type UseCheckMonitorOptions<T extends object> =
	& ComponentDataProps<T>
	& CheckProps<T>
	& { $supplyOn?: CheckPropSuppliedOn };

export interface UseCheckMonitorResult {
	error?: CheckResultWithLevel;
}

export interface DataCheckState {
	error?: CheckResultWithLevel;
}
