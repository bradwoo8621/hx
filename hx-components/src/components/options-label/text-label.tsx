import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactNode} from 'react';
import {HxLabel} from '../label';
import {useSelectOptions} from '../select-options';
import {HxOptionsLabelDefaults} from './defaults';
import type {HxOptionsLabelProps} from './types';

export type HxOptionsLabelTextProps<T extends object> = Omit<HxOptionsLabelProps<T>, 'options' | 'optionsDependsOn' | 'onOptionsChange'>;

export const HxOptionsLabelText =
	forwardRef(<T extends object>(props: HxOptionsLabelTextProps<T>, ref: ForwardedRef<HTMLSpanElement>) => {
		const {
			$model, $field,
			optionsOnLoadKey = HxOptionsLabelDefaults.optionsOnLoadKey,
			noOptionsKey = HxOptionsLabelDefaults.noOptionsKey,
			optionNotFoundKey = HxOptionsLabelDefaults.optionNotFoundKey,
			...rest
		} = props;

		const optionsRef = useSelectOptions({$model, $field});

		// Show loading state when options are being fetched
		if (!optionsRef.current.loaded) {
			return <HxLabel {...rest} text={optionsOnLoadKey}
			                data-hx-options-label="" data-hx-options-label-state="loading"
			                ref={ref}/>;
			// Show empty state when no options available
		} else if (optionsRef.current.options.length === 0) {
			return <HxLabel {...rest} text={noOptionsKey}
			                data-hx-options-label="" data-hx-options-label-state="no-options"
			                ref={ref}/>;
		}

		const value = ERO.getValue($model, $field);
		if (value == null) {
			return <HxLabel {...rest} text=""
			                data-hx-options-label="" data-hx-options-label-state="no-value"
			                ref={ref}/>;
		}

		if (Array.isArray(value)) {
			let hasNotFoundOption = false;
			const text = value.reduce((text: Array<ReactNode>, v) => {
				const option = optionsRef.current.options.find(option => option.value == v);
				if (option == null) {
					// eslint-disable-next-line react-hooks/immutability
					hasNotFoundOption = true;
				} else {
					if (text.length !== 0) {
						text.push(',');
					}
					text.push(<HxLabel text={option.selectedLabel ?? option.label}/>);
				}
				return text;
			}, [] as Array<ReactNode>);

			let state: string;
			if (text.length === 0) {
				state = 'option-not-found';
			} else if (hasNotFoundOption) {
				state = 'some-option-not-found';
			} else {
				state = 'option-found';
			}

			return <HxLabel {...rest} text={text}
			                data-hx-options-label="" data-hx-options-label-state={state}
			                data-hx-options-label-value={value.join(',')}
			                ref={ref}/>;
		} else {
			const option = optionsRef.current.options.find(option => option.value == value);
			if (option == null) {
				return <HxLabel {...rest} text={optionNotFoundKey}
				                data-hx-options-label="" data-hx-options-label-state="option-not-found"
				                data-hx-options-label-value={value}
				                ref={ref}/>;
			} else {
				return <HxLabel {...rest} text={option.selectedLabel ?? option.label}
				                data-hx-options-label="" data-hx-options-label-state="option-found"
				                data-hx-options-label-value={value}
				                ref={ref}/>;
			}
		}
	});
HxOptionsLabelText.displayName = 'HxOptionsLabelText';
