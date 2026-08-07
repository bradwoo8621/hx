// @ts-expect-error import React
import React, {useEffect, useState} from 'react';
import type {ComputedMonths} from '../../utils';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {type EvtHxDateTimePicker_DatePanel, EvtHxDateTimePicker_SwitchDatePanel} from './types';

export interface HxDatetimePickerPopupMonthsProps {
	stateRef: HxDateTimePickerStateRef;
}

interface HxDateTimePickerPopupMonthsState {
	visible: 'hide' | 'prepare' | 'show';
	months: ComputedMonths;
}

export const HxDatetimePickerPopupMonths = (props: HxDatetimePickerPopupMonthsProps) => {
	const {stateRef} = props;

	const popupContext = useHxPopupContext();
	const [state, setState] = useState<HxDateTimePickerPopupMonthsState>({visible: 'hide', months: []});
	useEffect(() => {
		if (state.visible === 'prepare') {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setState(state => {
				return {...state, visible: 'show'};
			});
		}
	}, [state.visible]);
	useEffect(() => {
		const onSwitchDatePanel = (panel: EvtHxDateTimePicker_DatePanel) => {
			if (panel !== 'months') {
				setState(state => {
					return {...state, visible: 'hide'};
				});
			} else {
				setState({visible: 'prepare', months: stateRef.months()});
			}
		};

		popupContext.on(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
		return () => {
			popupContext.off(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
		};
	}, [popupContext, stateRef]);

	const onMonthClick = (monthOffset: number) => () => {
		stateRef.changeMonth(monthOffset);
		stateRef.switchDatePanel('days');
	};

	return <div data-hx-dtp-panel-months="" data-hx-dtp-panel-months-visible={state.visible}>
		{state.months.map(month => {
			return <HxLabel data-hx-dtp-panel-month-gregory={month.key}
			                data-hx-dtp-panel-month-available={month.available}
			                data-hx-dtp-panel-this-month={month.offset === 0 ? '' : (void 0)}
			                hoverable={true}
			                text={month.label} key={month.key}
			                onClick={month.available ? onMonthClick(month.offset) : (void 0)}/>;
		})}
	</div>;
};
