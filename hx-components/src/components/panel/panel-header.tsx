// @ts-expect-error import React
import React, {type MouseEventHandler} from 'react';
import {useHxContext} from '../../contexts';
import type {HxObject} from '../../types';
import {DOMUtils} from '../../utils';
import {HxButton} from '../button';
import {HxFlex} from '../flex';
import {Collapse, Expand} from '../icons';
import {HxLabel} from '../label';
import {HxPanelDefaults} from './defaults';
import {useHxPanel} from './panel-provider';
import type {HxPanelProps} from './types';

export type HxPanelHeaderProps<T extends object> =
// eslint-disable-next-line @typescript-eslint/no-explicit-any
	& Pick<HxPanelProps<any>,
		| 'title'
		| 'headerJustifyContent'
		| 'headerAlignItems' | 'headerAlignContent'
		| 'headerGapX' | 'headerGapY'
		| 'headerPaddingX' | 'headerPaddingT' | 'headerPaddingB'
		| '$domHeader'>
	& {
	$model?: HxObject<T>;
	collapsible: boolean;
}

export const HxPanelHeader = <T extends object>(props: HxPanelHeaderProps<T>) => {
	const {
		$model, collapsible,
		title,
		headerJustifyContent = HxPanelDefaults.headerJustifyContent,
		headerAlignItems = HxPanelDefaults.headerAlignItems,
		headerAlignContent = HxPanelDefaults.headerAlignContent,
		headerGapX = HxPanelDefaults.headerGapX, headerGapY = HxPanelDefaults.headerGapY,
		headerPaddingX = HxPanelDefaults.headerPaddingX,
		headerPaddingT = HxPanelDefaults.headerPaddingT, headerPaddingB = HxPanelDefaults.headerPaddingB,
		$domHeader
	} = props;

	const context = useHxContext();
	const panelContext = useHxPanel();
	/**
	 * Handle collapse/expand button click event
	 * Toggles panel collapsed state and updates DOM attribute
	 */
	const onCollapseClick: MouseEventHandler<HTMLButtonElement> = () => {
		panelContext.checkCollapsed((collapsed) => {
			if (collapsed) {
				panelContext.expand();
			} else {
				panelContext.collapse();
			}
		});
	};

	const {
		// @ts-expect-error ignore property check
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		border, 'data-hx-border': _1, borderRadius, 'data-hx-border-radius': _2,
		...filteredDomHeaderProps
	} = $domHeader ?? {};

	const headerProps = DOMUtils.exposePropsToDOM(filteredDomHeaderProps, $model, context, {
		key: 'HxFlex', default: {
			border: false,
			justifyContent: headerJustifyContent, alignItems: headerAlignItems, alignContent: headerAlignContent,
			gapX: headerGapX, gapY: headerGapY,
			paddingX: headerPaddingX, paddingT: headerPaddingT, paddingB: headerPaddingB
		}
	});

	return <HxFlex {...headerProps} $model={$model} data-hx-panel-header="">
		<HxLabel text={title} data-hx-panel-title=""/>
		{collapsible
			? (<HxButton variant="ghost"
			             text={<><Expand/><Collapse/></>}
			             onClick={onCollapseClick}
			             data-hx-panel-collapse-button=""/>)
			: (void 0)}
	</HxFlex>;
};
