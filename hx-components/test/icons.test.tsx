import type {ComponentType} from 'react';
import {describe, expect, it} from 'vitest';
import * as Icons from '../src/components/icons';
import type {IconProps} from '../src/components/icons';
import {renderWithProvider} from './test-utils';

type IconComponent = ComponentType<IconProps>;

const ICONS: Array<[string, string]> = [
	['CaretDown', 'caret-down'],
	['CaretUp', 'caret-up'],
	['CaretLeft', 'caret-left'],
	['CaretRight', 'caret-right'],
	['TriangleDown', 'triangle-down'],
	['TriangleUp', 'triangle-up'],
	['TriangleLeft', 'triangle-left'],
	['TriangleRight', 'triangle-right'],
	['ChevronDown', 'chevron-down'],
	['ChevronUp', 'chevron-up'],
	['ChevronLeft', 'chevron-left'],
	['ChevronRight', 'chevron-right'],
	['DoubleArrowDown', 'double-arrow-down'],
	['DoubleArrowUp', 'double-arrow-up'],
	['DoubleArrowLeft', 'double-arrow-left'],
	['DoubleArrowRight', 'double-arrow-right'],
	['Archive', 'archive'],
	['MagnifyingGlass', 'magnifying-glass'],
	['House', 'house'],
	['Calendar', 'calendar'],
	['Clock', 'clock'],
	['Link2', 'link2'],
	['LinkBreak', 'link-break'],
	['FileText', 'file-text'],
	['DotsY', 'dots-y'],
	['DotsX', 'dots-x'],
	['Check', 'check'],
	['Clear', 'clear'],
	['Expand', 'expand'],
	['Collapse', 'collapse'],
	['Upload', 'upload'],
	['Download', 'download'],
	['Plus', 'plus'],
	['Minus', 'minus'],
	['Trash', 'trash'],
	['EyeOpen', 'eye-open'],
	['EyeNone', 'eye-none'],
	['EyeClosed', 'eye-closed'],
	['Update', 'update'],
	['ZoomIn', 'zoom-in'],
	['ZoomOut', 'zoom-out'],
	['Cross1', 'cross-1'],
	['Close', 'close'],
	['Margin', 'margin'],
	['Info', 'info'],
	['Success', 'success'],
	['Question', 'question'],
	['Exclamation', 'exclamation'],
	['Error', 'error']
];

describe('Icons', () => {
	it.each(ICONS)('renders %s as an svg icon named %s', (exportName, iconName) => {
		const Icon = (Icons as unknown as Record<string, IconComponent>)[exportName];
		expect(typeof Icon).toBe('function');
		const {container} = renderWithProvider(<Icon/>);
		const svg = container.querySelector<SVGSVGElement>(`svg[data-hx-svg-icon-name="${iconName}"]`)!;
		expect(svg).not.toBeNull();
		expect(svg.getAttribute('data-hx-svg-icon')).toBe('');
		expect(svg.getAttribute('width')).toBe('15');
		expect(svg.getAttribute('height')).toBe('15');
		expect(svg.getAttribute('viewBox')).toBe('0 0 15 15');
		expect(svg.getAttribute('fill')).toBe('none');
		expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
	});

	it('maps margin props to data attributes', () => {
		const {container} = renderWithProvider(<Icons.Info marginT={1} marginR={2} marginB={3} marginL={4}/>);
		const svg = container.querySelector('svg')!;
		expect(svg.getAttribute('data-hx-margin-t')).toBe('1');
		expect(svg.getAttribute('data-hx-margin-r')).toBe('2');
		expect(svg.getAttribute('data-hx-margin-b')).toBe('3');
		expect(svg.getAttribute('data-hx-margin-l')).toBe('4');
	});

	it('forwards data-* props and style', () => {
		const {container} = renderWithProvider(
			<Icons.Info data-hx-color="primary" style={{opacity: 0.5}}/>
		);
		const svg = container.querySelector('svg')!;
		expect(svg.getAttribute('data-hx-color')).toBe('primary');
		expect(svg.style.opacity).toBe('0.5');
	});
});
