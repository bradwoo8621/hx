// @ts-expect-error import React
import React, {
	isValidElement,
	type KeyboardEventHandler,
	type MouseEventHandler,
	type ReactNode,
	useEffect,
	useRef
} from 'react';
import {useDataMonitor} from '../../hooks';
import type {HxObject} from '../../types';
import {interposeToChildren} from '../../utils';
import {HxLabel} from '../label';
import {useHxTabs} from './tabs-provider';
import type {HxTab, HxTabsBorderRadius} from './types';

export type HxTabHeaderProps<T extends object> =
	& Omit<HxTab<T>, 'defaultActive' | 'body'>
	& {
	border?: boolean;
	borderRadius?: HxTabsBorderRadius;
	$model?: HxObject<T>;
	index: number;
};

export const HxTabHeader = <T extends object>(props: HxTabHeaderProps<T>) => {
	const {
		$model,
		mark: givenMark, index: tabIndex, header,
		border, borderRadius
	} = props;

	const tabsContext = useHxTabs();
	const {visible, disabled} = useDataMonitor(props);
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const onCheckActiveable = (index: number, _: string | null | undefined, callback: (activeable: boolean) => void) => {
			if (index === tabIndex) {
				callback(!disabled);
			}
		};
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const onDoActive = (index: number, _: string | null | undefined) => {
			if (index !== tabIndex) {
				ref.current?.removeAttribute('data-hx-tab-active');
			} else {
				ref.current?.setAttribute('data-hx-tab-active', '');
			}
		};

		tabsContext.onCheckActiveable(onCheckActiveable);
		tabsContext.onDoActive(onDoActive);

		return () => {
			tabsContext.offCheckActiveable(onCheckActiveable);
			tabsContext.offDoActive(onDoActive);
		};
	}, [disabled, tabIndex, tabsContext]);
	useEffect(() => {
		tabsContext.checkActive(tabIndex, (active) => {
			if (active) {
				ref.current?.setAttribute('data-hx-tab-active', '');
			}
		});
	}, [tabIndex, tabsContext]);

	const onTabHeaderClick: MouseEventHandler<HTMLDivElement> = () => {
		if (!visible || disabled) {
			return;
		}
		tabsContext.active(tabIndex);
	};
	const onTabHeaderKeyDown: KeyboardEventHandler<HTMLDivElement> = (ev) => {
		if (!visible || disabled) {
			return;
		}
		switch (ev.key) {
			case ' ': {
				tabsContext.active(tabIndex);
				ev.preventDefault();
				break;
			}
		}
	};

	let content: ReactNode;
	if (isValidElement(header)) {
		content = interposeToChildren({$model}, header);
	} else {
		content = <HxLabel $model={$model} text={header}/>;
	}
	const mark = givenMark || (void 0);

	return <div tabIndex={0} onClick={onTabHeaderClick} onKeyDown={onTabHeaderKeyDown}
	            data-hx-tab-header=""
	            data-hx-tab-index={tabIndex} data-hx-tab-mark={mark}
	            data-hx-border={border ? '' : (void 0)} data-hx-border-radius={borderRadius}
	            data-hx-visible={(visible ?? true) ? '' : 'no'}
	            data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
	            ref={ref}>
		{content}
	</div>;
};
