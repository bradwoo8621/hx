// @ts-expect-error import React
import React from 'react';
import type {HxObject} from '../../types';
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

	return <HxGrid {...$domBody} $model={$model}
	               border={false}
	               columns={bodyColumns}
	               justifyItems={bodyJustifyItems} justifyContent={bodyJustifyContent}
	               alignItems={bodyAlignItems} alignContent={bodyAlignContent}
	               gapX={bodyGapX} gapY={bodyGapY}
	               paddingX={bodyPaddingX} paddingT={bodyPaddingT} paddingB={bodyPaddingB}
	               data-hx-panel-body="">
		{children}
	</HxGrid>;
};
