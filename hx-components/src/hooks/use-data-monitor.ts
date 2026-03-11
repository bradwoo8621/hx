import type {ReactiveObject} from '@hx/data';
import type {ChangeMonitorProps, ComponentDataProps, DisabledProps, ReadonlyProps, VisibleProps} from '../types';

export type UseDataMonitorOptions<M extends ReactiveObject & object> =
	& ComponentDataProps<M>
	& VisibleProps<M>
	& DisabledProps<M>
	& ReadonlyProps<M>
	& ChangeMonitorProps<M>;

export interface UseDataMonitorResult {
	visible: boolean;
	disabled: boolean;
	readonly: boolean;
}

export const useDataMonitor =
	<M extends ReactiveObject & object>(_options: UseDataMonitorOptions<M>): UseDataMonitorResult => {
		return {
			visible: true,
			disabled: false,
			readonly: false
		};
	};
