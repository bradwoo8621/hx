import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type HTMLAttributes, isValidElement, type ReactNode} from 'react';
import {useHxContext} from '../../contexts';
import type {HxHtmlElementProps} from '../../types';
import {exposePropsToDOM, forceInterposeToChildren} from '../../utils';
import {HxButton} from '../button';
import {HxFlex} from '../flex';
import {TriangleDown} from '../icons';
import {HxLabel} from '../label';
import type {
	HxActionsColor,
	HxActionsLeading,
	HxActionVarious,
	HxExtActionsProps,
	OmittedActionsHTMLProps
} from './types';

export type HxActionsLeadingProps<T extends object> =
	& Pick<HxExtActionsProps<T>, '$model'>
	& HxHtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>, OmittedActionsHTMLProps, T>
	& {
	color: HxActionsColor;
	various: HxActionVarious;
	leading: HxActionsLeading;
	/** Whether the select is visible */
	visible: boolean;
	/** Whether the select is disabled */
	disabled: boolean;
};

export const HxActionsLeadingContent =
	forwardRef(<T extends object>(props: HxActionsLeadingProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		const {
			$model,
			color, various, visible, disabled,
			leading,
			...rest
		} = props;

		const context = useHxContext();
		// const popupContext = useHxPopupContext();

		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);

		let children: ReactNode;
		if (typeof leading === 'string') {
			children = <HxButton text={<>
				<HxLabel text={leading}/>
				<HxLabel text={<TriangleDown/>}/>
			</>} color={color} various={various}/>;
		} else if (Array.isArray(leading)) {
			children = <>
				{leading.map(btn => {
					return forceInterposeToChildren({color, various}, btn);
				})}
				<HxButton data-hx-button-svg-icon=""
				          text={<HxLabel text={<TriangleDown/>}/>}
				          color={color} various={various}/>
			</>;
		} else if (isValidElement(leading)) {
			// @ts-expect-error ignore the displayName existing check
			const type = leading.type === 'string' ? leading.type : leading.type.displayName;
			switch (type) {
				case 'HxButton': {
					children = <>
						{forceInterposeToChildren({color, various}, leading)}
						<HxButton data-hx-button-svg-icon=""
						          text={<HxLabel text={<TriangleDown/>}/>}
						          color={color} various={various}/>
					</>;
					break;
				}
				case 'HxLabel': {
					children = <HxButton text={<>
						{leading}
						<HxLabel text={<TriangleDown/>}/>
					</>} color={color} various={various}/>;
					break;
				}
				default: {
					children = leading;
					break;
				}
			}
		}

		return <HxFlex {...restProps}
		               wrap={false} alignItems="center" gapX="none"
		               style={{
			               // @ts-expect-error ignore the name check
			               '--hx-border-radius': 'var(--hx-border-radius-atomic)'
		               }}
		               data-hx-actions=""
		               data-hx-model-path={ERO.loosePathOf($model)}
		               data-hx-visible={(visible ?? true) ? '' : (void 0)}
		               data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
		               ref={ref}>
			{children}
		</HxFlex>;
	});
