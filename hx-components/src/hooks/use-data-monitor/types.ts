import type {ReactiveObject} from '@hx/data';
import type {
	ChangeProps,
	CheckProps,
	CheckResultWithLevel,
	ComponentDataProps,
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

export type UseCheckMonitorOptions<M extends ReactiveObject & object> =
	& ComponentDataProps<M>
	& CheckProps<M>;

export interface UseCheckMonitorResult {
	error?: CheckResultWithLevel;
}

export interface DataCheckState {
	error?: CheckResultWithLevel;
}
