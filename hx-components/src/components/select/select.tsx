import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type MouseEventHandler,
	type PropsWithoutRef,
	type ReactElement,
	type ReactNode,
	type RefAttributes,
	useEffect,
	useState
} from 'react';
import {type HxContext, useHxContext} from '../../contexts';
import {type CheckPropSuppliedOn, useDataMonitor} from '../../hooks';
import type {EditSingleFieldProps, HxHtmlElementProps, HxObject, HxOmittedAttributes, ReadonlyProps} from '../../types';
import {exposePropsToDOM} from '../../utils';
import {HxLabel} from '../label';
import {HxPopup} from '../popup';
import {HxWithCheck, type HxWithCheckCreateOptions, type HxWithCheckProps} from '../with-check';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface HxSelectOption<V = any> {
	value: V;
	label: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HxSelectOptions<T extends object, V = any> =
	| Array<HxSelectOption<V>>
	| ((model: HxObject<T>, context: HxContext) => Array<HxSelectOption<V>>)
	| ((model: HxObject<T>, context: HxContext) => Promise<Array<HxSelectOption<V>>>);

export interface HxExtSelectProps<T extends object>
	extends EditSingleFieldProps<T>, ReadonlyProps<T> {
	options: HxSelectOptions<T>;
	filter?: boolean;
	sort?: boolean;
}

export type OmittedSelectHTMLProps =
	| HxOmittedAttributes
	| 'children';

export type HxSelectProps<T extends object> = PropsWithoutRef<
	& HxExtSelectProps<T>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedSelectHTMLProps, T>
>;

export type HxSelectType = <T extends object>(
	props: HxSelectProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

const getOptions = async <T extends object>(
	model: HxObject<T>, context: HxContext,
	options: HxSelectOptions<T>
): Promise<Array<HxSelectOption>> => {
	const typeOfOptions = typeof options;
	if (typeOfOptions === 'function') {
		const ret = (options as Exclude<HxSelectOptions<T>, Array<HxSelectOption>>)(model, context);
		if (Array.isArray(ret)) {
			return ret;
		} else {
			return await ret;
		}
	} else {
		return options as Array<HxSelectOption>;
	}
};

export const HxSelect =
	forwardRef(<T extends object>(props: HxSelectProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model, $field,
			options, //filter, sort,
			onClick,
			...rest
		} = props;

		const context = useHxContext();
		const [selectOptions, setSelectOptions] = useState<Array<HxSelectOption>>([]);
		const [popupVisible, setPopupVisible] = useState<boolean>(false);
		const {visible, disabled} = useDataMonitor(props);

		useEffect(() => {
			(async () => {
				setSelectOptions(await getOptions($model, context, options));
			})();
		}, [$model, context, options]);

		const onSelectClick: MouseEventHandler<HTMLDivElement> = (ev) => {
			if (!popupVisible) {
				setPopupVisible(true);
			}
			onClick?.(ev, $model, context);
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const onSelectOptionClick = (value: any): MouseEventHandler<HTMLSpanElement> => {
			return (): void => {
				const currentValue = ERO.getValue($model, $field);
				if (currentValue != value) {
					ERO.setValue($model, $field, currentValue);
				}
				setPopupVisible(false);
			};
		};

		const value = ERO.getValue($model, $field);
		const label = selectOptions.find(option => option.value === value)?.label;
		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);

		return <div {...restProps}
		            data-hx-select=""
		            onClick={onSelectClick}
		            data-hx-visible={visible ?? true}
		            data-hx-disabled={disabled ?? false}
		            ref={ref}>
			<HxLabel text={label}/>
			<HxPopup mode="popup" visible={popupVisible}>
				{selectOptions.map(option => {
					const {value, label} = option;
					return <HxLabel text={label} onClick={onSelectOptionClick(value)}/>;
				})}
			</HxPopup>
		</div>;
	}) as unknown as HxSelectType;
// @ts-expect-error assign component name
HxSelect.displayName = 'HxSelect';

/** select with check */
const HxWithCheckSelectOptions: HxWithCheckCreateOptions<object, HxSelectProps<object>> = {
	$supplyOn: (props: HxSelectProps<object>): CheckPropSuppliedOn => {
		return props.$field;
	}
};
export type HxWithCheckSelectType = <T extends object>(
	props: HxWithCheckProps<T, HxSelectProps<T>> & RefAttributes<HTMLDivElement>
) => ReactElement | null;
export const HxWithCheckSelect = HxWithCheck(HxSelect, HxWithCheckSelectOptions) as unknown as HxWithCheckSelectType;
// @ts-expect-error assign component name
HxWithCheckSelect.displayName = 'HxWithCheckSelect';
