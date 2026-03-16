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
	& ChangeProps<M>
	& CheckProps<M>;

export interface UseDataMonitorResult {
	visible: boolean;
	disabled: boolean;
	readonly: boolean;
	error?: CheckResultWithLevel;
}

export interface DataMonitorState {
	visible: boolean;
	disabled: boolean;
	readonly: boolean;
	error?: CheckResultWithLevel;
}
