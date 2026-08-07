// @ts-expect-error import React
import React, {useEffect, useState} from 'react';
import type {ComputedYears} from '../../utils';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {type EvtHxDateTimePicker_DatePanel, EvtHxDateTimePicker_SwitchDatePanel} from './types';

export interface HxDatetimePickerPopupYearsProps {
	stateRef: HxDateTimePickerStateRef;
}

interface HxDateTimePickerPopupYearsState {
	visible: 'hide' | 'prepare' | 'show';
	years: ComputedYears;
}

export const HxDatetimePickerPopupYears = (props: HxDatetimePickerPopupYearsProps) => {
	const {stateRef} = props;

	const popupContext = useHxPopupContext();
	const [state, setState] = useState<HxDateTimePickerPopupYearsState>({visible: 'hide', years: []});
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
			if (panel !== 'years') {
				setState(state => {
					return {...state, visible: 'hide'};
				});
			} else {
				setState({visible: 'prepare', years: stateRef.years()});
			}
		};

		popupContext.on(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
		return () => {
			popupContext.off(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
		};
	}, [popupContext, stateRef]);

	const onYearClick = (yearOffset: number) => () => {
		stateRef.changeYear(yearOffset);
		stateRef.switchDatePanel('days');
	};

	return <div data-hx-dtp-panel-years="" data-hx-dtp-panel-years-visible={state.visible}>
		{state.years.map(year => {
			return <HxLabel data-hx-dtp-panel-year-gregory={year.key}
			                data-hx-dtp-panel-year-available={year.available ? '' : (void 0)}
			                data-hx-dtp-panel-this-year={year.offset === 0 ? '' : (void 0)}
			                hoverable={true}
			                text={year.label} key={year.key}
			                onClick={year.available ? onYearClick(year.offset) : (void 0)}/>;
		})}
	</div>;
};
