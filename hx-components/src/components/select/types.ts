import type {HTMLAttributes, PropsWithoutRef, ReactElement, ReactNode, RefAttributes} from 'react';
import type {HxContext} from '../../contexts';
import type {
	EditSingleFieldProps,
	HxHtmlElementProps,
	HxObject,
	HxOmittedAttributes,
	WidthConstrainedProps
} from '../../types';

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
	extends EditSingleFieldProps<T>, WidthConstrainedProps {
	options: HxSelectOptions<T>;
	filter?: boolean;
	sort?: boolean;
	zIndex?: number;
	gapToEdge?: number;
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

export const EvtOptionSelect = 'option-select';
export const EvtOptionsLoad = 'options-load';
export const EvtOptionsChange = 'options-change';
