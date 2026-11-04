import {reactive} from '@hx/data';
import {fireEvent} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {HxLabel, HxPanel} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

describe('HxPanel', () => {
	it('renders the title, header and body with defaults', () => {
		const {container} = renderWithProvider(<HxPanel title="Details">body content</HxPanel>);
		const panel = queryByDataAttr(container, 'data-hx-panel')!;
		expect(panel.getAttribute('data-hx-border')).toBe('');
		expect(panel.getAttribute('data-hx-border-radius')).toBe('md');
		expect(panel.hasAttribute('data-hx-panel-collapsed')).toBe(false);

		const header = queryByDataAttr(container, 'data-hx-panel-header')!;
		expect(header.getAttribute('data-hx-flex-direction')).toBe('dir-x');
		expect(header.getAttribute('data-hx-justify-content')).toBe('space-between');
		expect(header.getAttribute('data-hx-align-items')).toBe('start');
		expect(queryByDataAttr(header, 'data-hx-panel-title')!.textContent).toBe('Details');

		const body = queryByDataAttr(container, 'data-hx-panel-body')!;
		expect(body.getAttribute('data-hx-grid-columns')).toBe('12');
		expect(body.textContent).toContain('body content');
	});

	it('renders no collapse button when not collapsible', () => {
		const {container} = renderWithProvider(<HxPanel title="Details"/>);
		expect(queryByDataAttr(container, 'data-hx-panel-collapse-button')).toBeNull();
	});

	it('collapses and expands through the collapse button', () => {
		const {container} = renderWithProvider(<HxPanel title="Details" collapsible/>);
		const panel = queryByDataAttr(container, 'data-hx-panel')!;
		const button = queryByDataAttr(container, 'data-hx-panel-collapse-button')!;

		fireEvent.click(button);
		expect(panel.hasAttribute('data-hx-panel-collapsed')).toBe(true);
		fireEvent.click(button);
		expect(panel.hasAttribute('data-hx-panel-collapsed')).toBe(false);
	});

	it('starts collapsed when defaultCollapsed is set', () => {
		const {container} = renderWithProvider(
			<HxPanel title="Details" collapsible defaultCollapsed/>
		);
		expect(queryByDataAttr(container, 'data-hx-panel')!.hasAttribute('data-hx-panel-collapsed')).toBe(true);
	});

	it('passes a nested model to the body children', () => {
		const model = reactive({user: {name: 'Ada'}});
		const {container} = renderWithProvider(
			<HxPanel $model={model} $field="user" title="User">
				<HxLabel $field="name"/>
			</HxPanel>
		);
		const label = [...container.querySelectorAll<HTMLElement>('[data-hx-label]')]
			.find(el => el.getAttribute('data-hx-model-path') === 'user.name')!;
		expect(label).toBeTruthy();
		expect(label.textContent).toBe('Ada');
		expect(queryByDataAttr(container, 'data-hx-panel')!.getAttribute('data-hx-model-path')).toBe('user');
	});

	it('accepts header and body overrides', () => {
		const {container} = renderWithProvider(
			<HxPanel title="Details"
			         headerPaddingX="sm" headerPaddingT="sm" headerPaddingB="sm"
			         bodyColumns={16} bodyGapX="sm" bodyPaddingX="sm">
				cell
			</HxPanel>
		);
		const header = queryByDataAttr(container, 'data-hx-panel-header')!;
		expect(header.getAttribute('data-hx-padding-x')).toBe('sm');
		const body = queryByDataAttr(container, 'data-hx-panel-body')!;
		expect(body.getAttribute('data-hx-grid-columns')).toBe('16');
		expect(body.getAttribute('data-hx-cell-gap-x')).toBe('sm');
		expect(body.getAttribute('data-hx-padding-x')).toBe('sm');
	});

	it('marks the hidden state and forwards the ref', () => {
		const ref = {current: null as HTMLDivElement | null};
		const {container} = renderWithProvider(<HxPanel title="x" $visible={false} ref={ref}/>);
		expect(queryByDataAttr(container, 'data-hx-panel')!.getAttribute('data-hx-visible')).toBe('no');
		expect(ref.current).not.toBeNull();
		expect(ref.current!.hasAttribute('data-hx-panel')).toBe(true);
	});
});
