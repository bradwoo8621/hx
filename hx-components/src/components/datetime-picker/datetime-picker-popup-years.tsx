// @ts-expect-error import React
import React, {type ReactNode, useEffect, useRef, useState} from 'react';
import {type ComputedYear, type ComputedYears, StringUtils} from '../../utils';
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
		const hide = () => {
			setTimeout(() => {
				// Delay the hide by 10ms to avoid flicker: when switching between months/years,
				// the days panel would otherwise be visible for a moment. Letting the new panel
				// appear first, then fading this one out, avoids the flash.
				setState(state => {
					return {...state, visible: 'hide'};
				});
			}, 10);
		};
		const onSwitchDatePanel = (panel: HxDateTimePicker_DatePanel) => {
			if (panel !== 'years') {
				hide();
			} else {
				setState({visible: 'prepare', years: stateRef.years()});
			}
		};
		const onStateValueChange = () => {
			if (stateRef.currentDatePanel() === 'years') {
				setState(state => {
					return {...state, years: stateRef.years()};
				});
			}
		};
		const onStateValueChangeAndHide = () => {
			stateRef.switchDatePanel('days', false);
			hide();
		};

		popupContext.on(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
		popupContext.on(EvtHxDateTimePicker_DaySelected, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_MonthSelected, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_MonthMoved, onStateValueChange);
		popupContext.on(EvtHxDateTimePicker_YearSelected, onStateValueChangeAndHide);
		popupContext.on(EvtHxDateTimePicker_YearMoved, onStateValueChange);
		return () => {
			popupContext.off(EvtHxDateTimePicker_SwitchDatePanel, onSwitchDatePanel);
			popupContext.off(EvtHxDateTimePicker_DaySelected, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_MonthSelected, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_MonthMoved, onStateValueChange);
			popupContext.off(EvtHxDateTimePicker_YearSelected, onStateValueChangeAndHide);
			popupContext.off(EvtHxDateTimePicker_YearMoved, onStateValueChange);
		};
	}, [popupContext, stateRef]);

	const onYearClick = (yearOffset: number) => () => {
		stateRef.changeYear(yearOffset, true);
		popupContext.emit(EvtHxDateTimePicker_YearSelected);
	};

	const labelOfYear = (year: ComputedYear): ReactNode => {
		const hasEra = !StringUtils.isBlank(year.era);
		const hasEras = year.eras != null && year.eras.length > 0;

		if (hasEra && hasEras) {
			return <>
				{year.label}
				<span data-hx-dtp-panel-year-era="">{year.era}</span>
				<span data-hx-dtp-panel-year-eras="">{year.eras!.join(' / ')}</span>
			</>;
		} else if (hasEra) {
			return <>
				{year.label}
				<span data-hx-dtp-panel-year-era="">{year.era}</span>
			</>;
		} else if (hasEras) {
			return <>
				{year.label}
				<span data-hx-dtp-panel-year-eras="">{year.eras!.join(' / ')}</span>
			</>;
		} else {
			return year.label;
		}
	};

	return <div data-hx-dtp-panel-years="" data-hx-dtp-panel-years-visible={state.visible} ref={containerRef}>
		{state.years.years.map(year => {
			return <HxLabel data-hx-dtp-panel-year-gregory={year.key}
			                data-hx-dtp-panel-this-year={year.thisYear ? '' : (void 0)}
			                hoverable={true}
			                text={labelOfYear(year)} key={year.key}
			                onClick={onYearClick(year.offset)}/>;
		})}
	</div>;
};
