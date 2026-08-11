// @ts-expect-error import React
import React, {useEffect, useRef, useState} from 'react';
import type {ComputedYears} from '../../utils';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import type {HxDateTimePickerStateRef} from './datetime-picker-popup-state-ref';
import {
	type EvtHxDateTimePicker_DatePanel,
	EvtHxDateTimePicker_SwitchDatePanel,
	EvtHxDateTimePicker_UpdateDaysPanel,
	EvtHxDateTimePicker_UpdateYearsPanel
} from './types';

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
	const containerRef = useRef<HTMLDivElement>(null);
	const [state, setState] = useState<HxDateTimePickerPopupYearsState>({
		visible: 'hide',
		years: {backward: false, forward: false, years: []}
	});
	useEffect(() => {
		if (state.visible === 'prepare') {
			if (containerRef.current != null) {
				const daysPanel = containerRef.current.previousElementSibling!.previousElementSibling! as HTMLDivElement;
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
		const onSwitchDatePanel = (panel: EvtHxDateTimePicker_DatePanel) => {
			if (panel !== 'years') {
				setTimeout(() => {
					// Delay the hide by 10ms to avoid flicker: when switching between months/years,
					// the days panel would otherwise be visible for a moment. Letting the new panel
					// appear first, then fading this one out, avoids the flash.
					setState(state => {
						return {...state, visible: 'hide'};
					});
				}, 10);
			} else {
				setState({visible: 'prepare', years: stateRef.years()});
			}
		};

		popupContext.on(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
		return () => {
			popupContext.off(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
		};
	}, [popupContext, stateRef]);
	useEffect(() => {
		const onUpdateYearPanel = () => {
			setState(state => {
				return {...state, years: stateRef.years()};
			});
		};
		popupContext.on(EvtHxDateTimePicker_UpdateYearsPanel, onUpdateYearPanel);
		return () => {
			popupContext.off(EvtHxDateTimePicker_UpdateYearsPanel, onUpdateYearPanel);
		};
	}, [popupContext, stateRef]);

	const onYearClick = (yearOffset: number) => () => {
		stateRef.changeYear(yearOffset);
		popupContext.emit(EvtHxDateTimePicker_UpdateDaysPanel);
		stateRef.switchDatePanel('days');
	};

	return <div data-hx-dtp-panel-years="" data-hx-dtp-panel-years-visible={state.visible} ref={containerRef}>
		{state.years.years.map(year => {
			return <HxLabel data-hx-dtp-panel-year-gregory={year.key}
			                data-hx-dtp-panel-this-year={year.offset === 0 ? '' : (void 0)}
			                hoverable={true}
			                text={year.label} key={year.key}
			                onClick={onYearClick(year.offset)}/>;
		})}
	</div>;
};
