import type {ReactiveObject} from '@hx/data';
import {useEffect} from 'react';
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
	<M extends ReactiveObject & object>(options: UseDataMonitorOptions<M>): UseDataMonitorResult => {
		const {
			$model,
			$visible, $disabled, $readonly,
			$changeMonitor
		} = options;

		useEffect(() => {
			return () => {
			};
		}, [
			$model,
			$visible, $disabled, $readonly,
			$changeMonitor
		]);

		return {
			visible: true,
			disabled: false,
			readonly: false
		};
	};
