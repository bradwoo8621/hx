import {reactive} from '@hx/data';
import {describe, expect, it} from 'vitest';
import {HxBox, HxFlex, HxGrid, HxLabel} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

describe('HxBox', () => {
	it('renders a div with box defaults', () => {
		const {container} = renderWithProvider(<HxBox>content</HxBox>);
		const div = queryByDataAttr(container, 'data-hx-box')!;
		expect(div.tagName.toLowerCase()).toBe('div');
		expect(div.textContent).toBe('content');
		expect(div.getAttribute('data-hx-visible')).toBe('');
		expect(div.hasAttribute('data-hx-border')).toBe(false);
	});

	it('maps border, radius, padding and color props', () => {
		const {container} = renderWithProvider(
			<HxBox border borderRadius="lg" paddingX="md" paddingT="sm" paddingB="sm"/>
		);
		const div = queryByDataAttr(container, 'data-hx-box')!;
		expect(div.getAttribute('data-hx-border')).toBe('');
		expect(div.getAttribute('data-hx-border-radius')).toBe('lg');
		expect(div.getAttribute('data-hx-padding-x')).toBe('md');
		expect(div.getAttribute('data-hx-padding-t')).toBe('sm');
		expect(div.getAttribute('data-hx-padding-b')).toBe('sm');
	});

	it('passes a nested model to child hx components', () => {
		const model = reactive({user: {name: 'Ada'}});
		const {container} = renderWithProvider(
			<HxBox $model={model} $field="user">
				<HxLabel $field="name"/>
			</HxBox>
		);
		const box = queryByDataAttr(container, 'data-hx-box')!;
		const label = queryByDataAttr(container, 'data-hx-label')!;
		expect(box.getAttribute('data-hx-model-path')).toBe('user');
		expect(label.getAttribute('data-hx-model-path')).toBe('user.name');
		expect(label.textContent).toBe('Ada');
	});

	it('materializes a missing child model object', () => {
		const model = reactive<{missing?: {name?: string}}>({});
		renderWithProvider(
			<HxBox $model={model} $field="missing">
				<HxLabel $field="name"/>
			</HxBox>
		);
		expect(model.missing).toEqual({});
	});

	it('passes regular DOM props through', () => {
		const {container} = renderWithProvider(<HxBox className="host-class" id="box-id"/>);
		const div = queryByDataAttr(container, 'data-hx-box')!;
		expect(div.classList.contains('host-class')).toBe(true);
		expect(div.id).toBe('box-id');
	});
});

describe('HxFlex', () => {
	it('renders with flex defaults', () => {
		const {container} = renderWithProvider(<HxFlex>items</HxFlex>);
		const div = queryByDataAttr(container, 'data-hx-flex')!;
		expect(div.getAttribute('data-hx-flex-direction')).toBe('dir-x');
		expect(div.getAttribute('data-hx-flex-wrap')).toBe('');
		expect(div.getAttribute('data-hx-justify-content')).toBe('normal');
		expect(div.getAttribute('data-hx-align-items')).toBe('normal');
		expect(div.getAttribute('data-hx-align-content')).toBe('normal');
	});

	it('maps layout props', () => {
		const {container} = renderWithProvider(
			<HxFlex direction="dir-y"
			        wrap={false}
			        justifyContent="space-between"
			        alignItems="center"
			        alignContent="start"
			        gapX="sm"
			        gapY="md"
			        border/>
		);
		const div = queryByDataAttr(container, 'data-hx-flex')!;
		expect(div.getAttribute('data-hx-flex-direction')).toBe('dir-y');
		expect(div.hasAttribute('data-hx-flex-wrap')).toBe(false);
		expect(div.getAttribute('data-hx-justify-content')).toBe('space-between');
		expect(div.getAttribute('data-hx-align-items')).toBe('center');
		expect(div.getAttribute('data-hx-align-content')).toBe('start');
		expect(div.getAttribute('data-hx-cell-gap-x')).toBe('sm');
		expect(div.getAttribute('data-hx-cell-gap-y')).toBe('md');
		expect(div.getAttribute('data-hx-border')).toBe('');
	});

	it('passes a nested model to child hx components', () => {
		const model = reactive({user: {name: 'Ada'}});
		const {container} = renderWithProvider(
			<HxFlex $model={model} $field="user">
				<HxLabel $field="name"/>
			</HxFlex>
		);
		expect(queryByDataAttr(container, 'data-hx-label')!.getAttribute('data-hx-model-path')).toBe('user.name');
		expect(queryByDataAttr(container, 'data-hx-label')!.textContent).toBe('Ada');
	});
});

describe('HxGrid', () => {
	it('renders with grid defaults', () => {
		const {container} = renderWithProvider(<HxGrid>cells</HxGrid>);
		const div = queryByDataAttr(container, 'data-hx-grid')!;
		expect(div.getAttribute('data-hx-grid-columns')).toBe('12');
		expect(div.getAttribute('data-hx-cell-gap-x')).toBe('md');
		expect(div.getAttribute('data-hx-justify-items')).toBe('normal');
		expect(div.getAttribute('data-hx-justify-content')).toBe('normal');
		expect(div.getAttribute('data-hx-align-items')).toBe('normal');
		expect(div.getAttribute('data-hx-align-content')).toBe('normal');
	});

	it('maps columns, alignment, gaps and cell position props', () => {
		const {container} = renderWithProvider(
			<HxGrid columns={16}
			        justifyItems="center"
			        justifyContent="space-around"
			        alignItems="end"
			        alignContent="space-evenly"
			        gapX="xl"
			        gapY="sm"/>
		);
		const div = queryByDataAttr(container, 'data-hx-grid')!;
		expect(div.getAttribute('data-hx-grid-columns')).toBe('16');
		expect(div.getAttribute('data-hx-justify-items')).toBe('center');
		expect(div.getAttribute('data-hx-justify-content')).toBe('space-around');
		expect(div.getAttribute('data-hx-align-items')).toBe('end');
		expect(div.getAttribute('data-hx-align-content')).toBe('space-evenly');
		expect(div.getAttribute('data-hx-cell-gap-x')).toBe('xl');
		expect(div.getAttribute('data-hx-cell-gap-y')).toBe('sm');
	});

	it('maps grid cell position props on a nested component', () => {
		const {container} = renderWithProvider(
			<HxGrid columns={12}>
				<HxLabel text="cell" gCol={2} gCols={4} gRow={1} gRows={2} gJustifySelf="center" gAlignSelf="end"/>
			</HxGrid>
		);
		const label = queryByDataAttr(container, 'data-hx-label')!;
		expect(label.getAttribute('data-hx-grid-cell-col')).toBe('2');
		expect(label.getAttribute('data-hx-grid-cell-cols')).toBe('4');
		expect(label.getAttribute('data-hx-grid-cell-row')).toBe('1');
		expect(label.getAttribute('data-hx-grid-cell-rows')).toBe('2');
		expect(label.getAttribute('data-hx-justify-self')).toBe('center');
		expect(label.getAttribute('data-hx-align-self')).toBe('end');
	});
});
