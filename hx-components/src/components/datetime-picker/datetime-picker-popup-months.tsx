// @ts-expect-error import React
import React, {useEffect, useRef, useState} from 'react';
import type {ComputedMonths} from '../../utils';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {
	EvtHxDateTimePicker_DaySelected,
	EvtHxDateTimePicker_MonthMoved,
	EvtHxDateTimePicker_MonthSelected,
	EvtHxDateTimePicker_SwitchDatePanel,
	EvtHxDateTimePicker_YearMoved,
	EvtHxDateTimePicker_YearSelected,
	type HxDateTimePicker_DatePanel
} from './types';

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
	const containerRef = useRef<HTMLDivElement>(null);
	const [state, setState] = useState<HxDateTimePickerPopupMonthsState>({visible: 'hide', months: []});
	useEffect(() => {
		if (state.visible === 'prepare') {
			if (containerRef.current != null) {
				const daysPanel = containerRef.current.previousElementSibling! as HTMLDivElement;
				const {height} = daysPanel.getBoundingClientRect();
				containerRef.current.style.setProperty('--height', `${height}px`);
				const headerPanel = daysPanel.previousElementSibling as HTMLDivElement;
				const {height: headerHeight} = headerPanel.getBoundingClientRect();
				containerRef.current.style.setProperty('--header-height', `${headerHeight}px`);
			}
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setState(state => {
				return {...state, visible: 'show'};
			});
		}
	}, [state.visible]);
	useEffect(() => {
		const hide = () => {
			// Delay the hide by 10ms to avoid flicker: when switching between months/years,
			// the days panel would otherwise be visible for a moment. Letting the new panel
			// appear first, then fading this one out, avoids the flash.
			setTimeout(() => {
				setState(state => {
					return {...state, visible: 'hide'};
				});
			}, 10);
		};
		const onSwitchDatePanel = (panel: HxDateTimePicker_DatePanel) => {
			if (panel !== 'months') {
				hide();
			} else {
				setState({visible: 'prepare', months: stateRef.months()});
			}
		};
		const onStateValueChange = () => {
			if (stateRef.currentDatePanel() === 'months') {
				setState(state => {
					return {...state, months: stateRef.months()};
				});
			}
		};
		const onStateValueChangeAndHide = () => {
			stateRef.switchDatePanel('days', false);
			hide();
		};

		popupContext.on(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
		popupContext.on(EvtHxDateTimePicker_DaySelected, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_MonthSelected, onStateValueChangeAndHide);
		popupContext.on(EvtHxDateTimePicker_MonthMoved, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_YearSelected, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_YearMoved, onStateValueChange);
		return () => {
			popupContext.off(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
			popupContext.off(EvtHxDateTimePicker_DaySelected, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_MonthSelected, onStateValueChangeAndHide);
			popupContext.off(EvtHxDateTimePicker_MonthMoved, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_YearSelected, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_YearMoved, onStateValueChange);
		};
	}, [popupContext, stateRef]);

	const onMonthClick = (monthOffset: number) => () => {
		stateRef.changeMonth(monthOffset, true);
		popupContext.emit(EvtHxDateTimePicker_MonthSelected);
	};

	return <div data-hx-dtp-panel-months="" data-hx-dtp-panel-months-visible={state.visible} ref={containerRef}>
		{state.months.map(month => {
			return <HxLabel data-hx-dtp-panel-month-gregory={month.key}
			                data-hx-dtp-panel-month-bc={month.bc ? '' : (void 0)}
			                data-hx-dtp-panel-month-y10k={month.y10k ? '' : (void 0)}
			                data-hx-dtp-panel-this-month={month.offset === 0 ? '' : (void 0)}
			                hoverable={true}
			                text={month.label} key={month.key}
			                onClick={(month.bc || month.y10k) ? (void 0) : onMonthClick(month.offset)}/>;
		})}
	</div>;
};
