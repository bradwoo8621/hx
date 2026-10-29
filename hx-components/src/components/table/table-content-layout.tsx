// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {useDelayedFunc} from '../../hooks';
import {useHxTable} from './table-provider';

export const HxTableContentLayout = () => {
	const tableContext = useHxTable();
	const {delay} = useDelayedFunc(30);
	const ref = useRef<HTMLDivElement>(null);
	const resizeMonitorEnablementRef = useRef(false);
	useEffect(() => {
		let resizeObserver: ResizeObserver | undefined;

		const clearStickyThings = (el: HTMLDivElement) => {
			el.removeAttribute('data-hx-table-cell-sticky-top');
			el.removeAttribute('data-hx-table-cell-sticky-left');
			el.removeAttribute('data-hx-table-cell-sticky-right');
			el.removeAttribute('data-hx-table-cell-z-index');
			el.style.removeProperty('--hx-table-cell-sticky');
			el.style.removeProperty('--hx-table-cell-sticky-top');
			el.style.removeProperty('--hx-table-cell-sticky-left');
			el.style.removeProperty('--hx-table-cell-sticky-right');
			el.style.removeProperty('--hx-table-cell-z-index');
		};
		const clearAllCells = (parent: Element) => {
			// clear all attributes and CSS properties about sticky
			[
				...parent.querySelectorAll(':scope > div[data-hx-table-header-cell]'),
				...parent.querySelectorAll(':scope > div[data-hx-table-body-cell]')
			].forEach((el) => {
				el.removeAttribute('data-hx-table-cell-sticky');
				clearStickyThings(el as HTMLDivElement);
			});
		};
		const clearNonStickyCells = (parent: Element) => {
			// clear all attributes and CSS properties about sticky
			[
				...parent.querySelectorAll(':scope > div[data-hx-table-header-cell]:not([data-hx-table-cell-sticky])'),
				...parent.querySelectorAll(':scope > div[data-hx-table-body-cell]:not([data-hx-table-cell-sticky])')
			].forEach((el) => {
				clearStickyThings(el as HTMLDivElement);
			});
		};
		const relayout = () => {
			const parent = ref.current?.parentElement;
			if (parent == null) {
				return;
			}
			// set width of no data row
			const noDataDiv = parent.querySelector<HTMLDivElement>(':scope > div[data-hx-table-body-no-data-cell]');
			noDataDiv?.style.setProperty('--hx-width-this-default', `${parent.clientWidth}px`);

			// set width of full line group cells
			const fullLineGroupCells = parent.querySelectorAll<HTMLDivElement>(':scope > div[data-hx-table-body-group-full-line-cell]');
			fullLineGroupCells.forEach(cell => {
				cell.style.setProperty('--hx-width-this-default', `${parent.clientWidth}px`);
			});

			if (!parent.hasAttribute('data-hx-table-content-sticky')) {
				clearAllCells(parent);
			} else {
				// compute borders, paddings, cell sizes.
				const computedParentStyle = window.getComputedStyle(parent);
				const blockStartOffset = parseFloat(computedParentStyle.borderBlockStart || '0') + parseFloat(computedParentStyle.paddingBlockStart || '0');
				const inlineStartOffset = parseFloat(computedParentStyle.borderInlineStart || '0') + parseFloat(computedParentStyle.paddingInlineStart || '0');
				const inlineEndOffset = parseFloat(computedParentStyle.borderInlineEnd || '0') + parseFloat(computedParentStyle.paddingInlineEnd || '0');
				const rowHeights = computedParentStyle.gridTemplateRows.split(' ').map(v => parseFloat(v));
				const columnWidths = computedParentStyle.gridTemplateColumns.split(' ').map(v => parseFloat(v));
				// sticky top
				const headerEndDiv = parent.querySelector(':scope > div[data-hx-table-header=end]');
				const maxHeaderRow = parseInt(headerEndDiv?.getAttribute('data-hx-table-header-end-row') ?? '0', 10);
				const rowStickyTops: Array<number> = [];
				for (let index = 0, count = rowHeights.length; index < count; index++) {
					if (index === 0) {
						rowStickyTops.push(blockStartOffset);
					} else {
						rowStickyTops.push(rowStickyTops[index - 1] + rowHeights[index - 1]);
					}
				}
				new Array(maxHeaderRow).fill(1).forEach((_, index) => {
					const rowIndex = index + 1;
					parent.querySelectorAll<HTMLDivElement>(`:scope > div[data-hx-table-header-cell][data-hx-table-cell-sticky-top][data-hx-table-cell-start-row='${rowIndex}']`)
						.forEach(cell => {
							cell.style.setProperty('--hx-table-cell-sticky-top', `${rowStickyTops[index]}px`);
						});
				});
				parent.querySelectorAll<HTMLDivElement>(':scope > div[data-hx-table-header-cell]:not([data-hx-table-cell-sticky-top])')
					.forEach(cell => cell.style.removeProperty('--hx-table-cell-sticky-top'));

				// sticky inline start/end
				const maxHeaderCol = columnWidths.length;
				const headerRowStickyLefts: Array<number> = [];
				const headerRowStickyRights: Array<number> = [];
				for (let index = 0, count = columnWidths.length; index < count; index++) {
					if (index === 0) {
						headerRowStickyLefts.push(inlineStartOffset);
						headerRowStickyRights.unshift(inlineEndOffset);
					} else {
						headerRowStickyLefts.push(headerRowStickyLefts[index - 1] + columnWidths[index - 1]);
						headerRowStickyRights.unshift(headerRowStickyRights[0] + columnWidths[count - index]);
					}
				}
				new Array(maxHeaderCol).fill(1).forEach((_, index) => {
					const columnIndex = index + 1;
					parent.querySelectorAll<HTMLDivElement>(`:scope > div[data-hx-table-cell-start-column='${columnIndex}']`)
						.forEach(cell => {
							if (cell.hasAttribute('data-hx-table-cell-sticky-left')) {
								cell.style.setProperty('--hx-table-cell-sticky-left', `${headerRowStickyLefts[index]}px`);
								if (columnIndex === 2 && cell.hasAttribute('data-hx-table-body-nested-cell')) {
									// the second column, and is nested cell
									// set width
									cell.style.setProperty('--hx-width-this-default', `${parent.clientWidth - headerRowStickyLefts[index]}px`);
								}
							}
							if (cell.hasAttribute('data-hx-table-cell-sticky-right')) {
								cell.style.setProperty('--hx-table-cell-sticky-right', `${headerRowStickyRights[index]}px`);
							}
						});
				});
				[
					...parent.querySelectorAll<HTMLDivElement>(':scope > div[data-hx-table-header-cell]'),
					...parent.querySelectorAll<HTMLDivElement>(':scope > div[data-hx-table-body-cell]')
				]
					.forEach(cell => {
						if (!cell.hasAttribute('data-hx-table-cell-sticky-left')) {
							cell.style.removeProperty('--hx-table-cell-sticky-left');
						}
						if (!cell.hasAttribute('data-hx-table-cell-sticky-right')) {
							cell.style.removeProperty('--hx-table-cell-sticky-right');
						}
					});

				clearNonStickyCells(parent);
			}

			if (resizeObserver == null) {
				resizeObserver = new ResizeObserver(() => {
					// use this flag to avoid the first round when call observe of observer
					if (!resizeMonitorEnablementRef.current) {
						resizeMonitorEnablementRef.current = true;
						return;
					}
					onContentLayout();
				});
				// observe will invoke the callback function once
				resizeObserver.observe(parent);
			}
		};
		const onContentLayout = () => {
			delay('relayout', relayout);
		};
		const onToggleResizeMonitor = (enabled: boolean) => {
			const parent = ref.current?.parentElement;
			if (resizeObserver != null && parent != null) {
				if (enabled && !resizeMonitorEnablementRef.current) {
					// switch to enabled, and origin is not enabled
					resizeObserver.observe(parent);
				} else if (!enabled && resizeMonitorEnablementRef.current) {
					// switch to disabled, and origin is enabled
					resizeObserver.unobserve(parent);
					resizeMonitorEnablementRef.current = false;
				}
			}
		};

		tableContext.onContentLayout(onContentLayout);
		tableContext.onToggleResizeMonitor(onToggleResizeMonitor);

		return () => {
			tableContext.offContentLayout(onContentLayout);
			tableContext.offToggleResizeMonitor(onToggleResizeMonitor);
			if (resizeObserver != null) {
				resizeObserver.disconnect();
			}
		};
	}, [delay, tableContext]);

	return <div data-hx-table-content-layout="" ref={ref}/>;
};
