// @ts-expect-error import React
import React from 'react';
import {useHxContext} from '../../contexts';
import type {HxObject} from '../../types';
import {DOMUtils} from '../../utils';
import {HxGrid} from '../grid';
import {HxPanelDefaults} from './defaults';
import type {HxPanelProps} from './types';

export type HxPanelBodyProps<T extends object> =
// eslint-disable-next-line @typescript-eslint/no-explicit-any
	& Pick<HxPanelProps<any>,
		| 'bodyColumns'
		| 'bodyJustifyContent' | 'bodyJustifyItems'
		| 'bodyAlignItems' | 'bodyAlignContent'
		| 'bodyGapX' | 'bodyGapY'
		| 'bodyPaddingX' | 'bodyPaddingT' | 'bodyPaddingB'
		| '$domBody'
		| 'children'>
	& { $model?: HxObject<T> }

export const HxPanelBody = <T extends object>(props: HxPanelBodyProps<T>) => {
	const {
		$model,
		bodyColumns = HxPanelDefaults.bodyColumns,
		bodyJustifyItems = HxPanelDefaults.bodyJustifyItems,
		bodyJustifyContent = HxPanelDefaults.bodyJustifyContent,
		bodyAlignItems = HxPanelDefaults.bodyAlignItems, bodyAlignContent = HxPanelDefaults.bodyAlignContent,
		bodyGapX = HxPanelDefaults.bodyGapX, bodyGapY = HxPanelDefaults.bodyGapY,
		bodyPaddingX = HxPanelDefaults.bodyPaddingX,
		bodyPaddingT = HxPanelDefaults.bodyPaddingT, bodyPaddingB = HxPanelDefaults.bodyPaddingB,
		$domBody,
		children
	} = props;

	const context = useHxContext();

	const {
		// @ts-expect-error ignore property check
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		border, 'data-hx-border': _1, borderRadius, 'data-hx-border-radius': _2,
		...filteredDomBodyProps
	} = $domBody ?? {};

	const bodyProps = DOMUtils.exposePropsToDOM(filteredDomBodyProps, $model, context, {
		key: 'HxGrid', default: {
			border: false,
			columns: bodyColumns,
			justifyItems: bodyJustifyItems, justifyContent: bodyJustifyContent,
			alignItems: bodyAlignItems, alignContent: bodyAlignContent,
			gapX: bodyGapX, gapY: bodyGapY,
			paddingX: bodyPaddingX, paddingT: bodyPaddingT, paddingB: bodyPaddingB
		}
	});

	return <HxGrid {...bodyProps} $model={$model} data-hx-panel-body="">
		{children}
	</HxGrid>;
};
