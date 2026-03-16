import type {ReactiveObject} from '@hx/data';
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

export type UseDataMonitorOptions<M extends ReactiveObject & object> =
	& ComponentDataProps<M>
	& VisibleProps<M>
	& DisabledProps<M>
	& ReadonlyProps<M>
	& ChangeProps<M>;

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

export type UseCheckMonitorOptions<M extends ReactiveObject & object> =
	& ComponentDataProps<M>
	& CheckProps<M>
	& { $supplyOn?: CheckPropSuppliedOn };

export interface UseCheckMonitorResult {
	error?: CheckResultWithLevel;
}

export interface DataCheckState {
	error?: CheckResultWithLevel;
}
