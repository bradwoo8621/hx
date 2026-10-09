// @ts-expect-error import React
import React, {useEffect, useRef} from 'react';
import {useDelayedFunc} from '../../hooks';
import {useHxTable} from './table-provider';
import {computeContentGutterSize} from './utils';

export const HxTableContentLayout = () => {
	const tableContext = useHxTable();
	const {delay} = useDelayedFunc(30);
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
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
			const noDataDiv = parent.querySelector<HTMLDivElement>(':scope > div[data-hx-table-no-data]');
			noDataDiv?.style.setProperty('--hx-width-this-default', `${parent.clientWidth}px`);

			if (!parent.hasAttribute('data-hx-table-content-sticky')) {
				clearAllCells(parent);
				return;
			} else {
				const headerEndDiv = parent.querySelector(':scope > div[data-hx-table-header=end]');
				const {
					blockStartOffset, inlineStartOffset, inlineEndOffset
				} = computeContentGutterSize(parent as HTMLDivElement);
				// sticky top
				const maxHeaderRow = parseInt(headerEndDiv?.getAttribute('data-hx-table-header-end-row') ?? '0', 10);
				const headerRowHeights = new Array(maxHeaderRow).fill(1).map((_, index) => {
					const rowIndex = index + 1;
					const cell = parent.querySelector(`:scope > div[data-hx-table-header-cell][data-hx-table-cell-start-row='${rowIndex}'][data-hx-table-cell-end-row='${rowIndex}']`);
					if (cell != null) {
						const {height} = cell.getBoundingClientRect();
						return height;
					} else {
						return 0;
					}
				});
				const headerRowStickyTops: Array<number> = [];
				for (let index = 0, count = headerRowHeights.length; index < count; index++) {
					if (index === 0) {
						headerRowStickyTops.push(blockStartOffset);
					} else {
						headerRowStickyTops.push(headerRowStickyTops[index - 1] + headerRowHeights[index - 1]);
					}
				}
				new Array(maxHeaderRow).fill(1).forEach((_, index) => {
					const rowIndex = index + 1;
					parent.querySelectorAll<HTMLDivElement>(`:scope > div[data-hx-table-header-cell][data-hx-table-cell-sticky-top][data-hx-table-cell-start-row='${rowIndex}']`)
						.forEach(cell => {
							cell.style.setProperty('--hx-table-cell-sticky-top', `${headerRowStickyTops[index]}px`);
						});
				});
				parent.querySelectorAll<HTMLDivElement>(':scope > div[data-hx-table-header-cell]:not([data-hx-table-cell-sticky-top])')
					.forEach(cell => cell.style.removeProperty('--hx-table-cell-sticky-top'));

				// sticky inline start/end
				const maxHeaderCol = parseInt(headerEndDiv?.getAttribute('data-hx-table-header-end-column') ?? '0', 10);
				const columnWidths = new Array(maxHeaderCol).fill(1).map((_, index) => {
					const columnIndex = index + 1;
					const cell = parent.querySelector(`:scope > div[data-hx-table-header-cell][data-hx-table-cell-start-column='${columnIndex}'][data-hx-table-cell-end-column='${columnIndex}']`);
					if (cell != null) {
						const {width} = cell.getBoundingClientRect();
						return width;
					} else {
						return 0;
					}
				});
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
		};
		const onContentLayout = () => {
			delay('relayout', relayout);
		};
		tableContext.onContentLayout(onContentLayout);

		return () => {
			tableContext.offContentLayout(onContentLayout);
		};
	}, [delay, tableContext]);

	return <div data-hx-table-content-layout="" ref={ref}/>;
};
