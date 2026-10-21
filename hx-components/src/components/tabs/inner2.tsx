import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type MutableRefObject} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useDualRef, usePropsToDomExpose} from '../../hooks';
import {HxDataUtils} from '../../utils';
import {HxTabsDefaults} from './defaults';
import {HxTabsInnerStateIndicator} from './inner-state-indicator';
import type {HxTabsContentRef} from './inner-types';
import {HxTabsBody} from './tabs-body';
import {HxTabsHeader} from './tabs-header';
import type {HxTabsProps} from './types';

export const HxTabsInner2 =
	forwardRef(<T extends object>(
		props: HxTabsProps<T> & { contentRef: MutableRefObject<HxTabsContentRef> },
		ref: ForwardedRef<HTMLDivElement>
	) => {
		const {
			$model, $field,
			border, borderRadius,
			contentPaddingX, contentPaddingT, contentPaddingB,
			contentContainerType, content,
			restoreScroll,

			contentRef,
			...rest
		} = props;

		const context = useHxContext();
		const {visible} = useDataMonitor(props);
		const containerRef = useDualRef(ref);

		const $modelToChild = HxDataUtils.resolveChildModel($model, $field);
		const restProps = usePropsToDomExpose(rest, $model, context, {
			key: 'HxTabs', default: HxTabsDefaults, visible
		});

		return <div {...restProps}
		            data-hx-tabs=""
		            data-hx-model-path={ERO.loosePathOf($model, $field)}
		            ref={containerRef}>
			<HxTabsInnerStateIndicator contentRef={contentRef}/>
			<HxTabsHeader $model={$modelToChild}
			              border={border} borderRadius={borderRadius}
			              content={content}/>
			<HxTabsBody $model={$modelToChild}
			            border={border} borderRadius={borderRadius}
			            contentPaddingX={contentPaddingX} contentPaddingT={contentPaddingT}
			            contentPaddingB={contentPaddingB}
			            contentContainerType={contentContainerType}
			            content={content}
			            restoreScroll={restoreScroll}/>
		</div>;
	});
HxTabsInner2.displayName = 'HxTabsInner2';
