import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type MouseEventHandler, useEffect, useRef} from 'react';
import {useHxContext} from '../../contexts';
import {useDualRef} from '../../hooks';
import {exposePropsToDOM} from '../../utils';
import {HxLabel} from '../label';
import {useHxPopupContext} from '../popup';
import {HxSelectDefaults} from './defaults';
import {EvtOptionsChange, EvtOptionSelect, EvtOptionsLoad, type HxSelectOption, type HxSelectProps} from './types';

export type HxSelectInputProps<T extends object> = Omit<
	HxSelectProps<T>,
	| 'zIndex' | 'gapToEdge' | 'options'
	| '$visible' | '$disabled'
> & {
	visible: boolean;
	disabled: boolean;
};

export const HxSelectInput =
	forwardRef(<T extends object>(props: HxSelectInputProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			visible, disabled,
			onClick,
			...rest
		} = props;

		const context = useHxContext();
		const popupContext = useHxPopupContext();
		const popupVisibleRef = useRef(false);
		const optionsRef = useRef({
			options: [] as Array<HxSelectOption>,
			loaded: false
		});
		const selectRef = useDualRef(ref);

		useEffect(() => {
			const onOptionSelect = (option: HxSelectOption) => {
				const currentValue = ERO.getValue($model, $field);
				if (currentValue != option.value) {
					ERO.setValue($model, $field, option.value);
					context.forceUpdate();
				}
				popupVisibleRef.current = false;
				popupContext.hide();
			};
			const onOptionsLoadOrChange = (options: Array<HxSelectOption>) => {
				optionsRef.current = {options, loaded: true};
				context.forceUpdate();
			};

			popupContext.on(EvtOptionSelect, onOptionSelect);
			popupContext.on(EvtOptionsLoad, onOptionsLoadOrChange);
			popupContext.on(EvtOptionsChange, onOptionsLoadOrChange);
			return () => {
				popupContext.off(EvtOptionSelect, onOptionSelect);
				popupContext.off(EvtOptionsLoad, onOptionsLoadOrChange);
				popupContext.off(EvtOptionsChange, onOptionsLoadOrChange);
			};
		}, [$model, $field, popupContext, context]);

		const onSelectClick: MouseEventHandler<HTMLDivElement> = (ev) => {
			if (!disabled && !popupVisibleRef.current) {
				const rect = selectRef.current!.getBoundingClientRect();
				popupVisibleRef.current = true;
				popupContext.show(rect);
			}
			onClick?.(ev, $model, context);
		};

		const value = ERO.getValue($model, $field);
		let label;
		// eslint-disable-next-line react-hooks/refs
		if (optionsRef.current.loaded) {
			// eslint-disable-next-line react-hooks/refs
			label = optionsRef.current.options.find(option => option.value === value)?.label;
		} else {
			label = HxSelectDefaults.optionsOnLoadKey;
		}
		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            tabIndex={0}
		            onClick={onSelectClick}
		            data-hx-select=""
		            data-hx-visible={visible ?? true}
		            data-hx-disabled={disabled ?? false}
		            ref={selectRef}>
			<HxLabel text={label} clickable={disabled && true}/>
		</div>;
	});
