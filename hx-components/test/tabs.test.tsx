import {reactive} from '@hx/data';
import {fireEvent} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {HxLabel, HxTabs, type HxTabsChildren} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

const content: HxTabsChildren = [
	{mark: 'first', header: 'First', body: <div data-testid="body-first">first body</div>},
	{mark: 'second', header: 'Second', body: <div data-testid="body-second">second body</div>},
	{mark: 'third', header: 'Third', body: <div data-testid="body-third">third body</div>}
];

const headers = (container: HTMLElement) => container.querySelectorAll<HTMLElement>('[data-hx-tab-header]');
const bodies = (container: HTMLElement) => container.querySelectorAll<HTMLElement>('[data-hx-tab-body]');

describe('HxTabs', () => {
	it('renders one header and one body per tab with the first tab active', () => {
		const {container} = renderWithProvider(<HxTabs content={content}/>);
		expect(queryByDataAttr(container, 'data-hx-tabs')).not.toBeNull();
		expect(headers(container)).toHaveLength(3);
		expect(bodies(container)).toHaveLength(3);
		expect(headers(container)[0].hasAttribute('data-hx-tab-active')).toBe(true);
		expect(bodies(container)[0].hasAttribute('data-hx-tab-active')).toBe(true);
		expect(headers(container)[0].getAttribute('data-hx-tab-mark')).toBe('first');
		expect(headers(container)[0].getAttribute('data-hx-tab-index')).toBe('0');
	});

	it('switches the active tab on header click', () => {
		const {container} = renderWithProvider(<HxTabs content={content}/>);
		fireEvent.click(headers(container)[1]);
		expect(headers(container)[1].hasAttribute('data-hx-tab-active')).toBe(true);
		expect(headers(container)[0].hasAttribute('data-hx-tab-active')).toBe(false);
		expect(bodies(container)[1].hasAttribute('data-hx-tab-active')).toBe(true);
		expect(bodies(container)[0].hasAttribute('data-hx-tab-active')).toBe(false);
	});

	it('honours defaultActive', () => {
		const {container} = renderWithProvider(
			<HxTabs content={[
				{mark: 'a', header: 'A', body: 'A body'},
				{mark: 'b', header: 'B', body: 'B body', defaultActive: true}
			] as HxTabsChildren}/>
		);
		expect(headers(container)[1].hasAttribute('data-hx-tab-active')).toBe(true);
	});

	it('activates a tab with the Enter key', () => {
		const {container} = renderWithProvider(<HxTabs content={content}/>);
		fireEvent.keyDown(headers(container)[2], {key: 'Enter'});
		expect(headers(container)[2].hasAttribute('data-hx-tab-active')).toBe(true);
	});

	it('does not activate a disabled tab', () => {
		const {container} = renderWithProvider(
			<HxTabs content={[
				{mark: 'a', header: 'A', body: 'A body'},
				{mark: 'b', header: 'B', body: 'B body', $disabled: true}
			] as HxTabsChildren}/>
		);
		expect(headers(container)[1].getAttribute('data-hx-disabled')).toBe('');
		fireEvent.click(headers(container)[1]);
		expect(headers(container)[0].hasAttribute('data-hx-tab-active')).toBe(true);
		expect(headers(container)[1].hasAttribute('data-hx-tab-active')).toBe(false);
	});

	it('does not activate a hidden tab', () => {
		const {container} = renderWithProvider(
			<HxTabs content={[
				{mark: 'a', header: 'A', body: 'A body'},
				{mark: 'b', header: 'B', body: 'B body', $visible: false}
			] as HxTabsChildren}/>
		);
		expect(headers(container)[1].getAttribute('data-hx-visible')).toBe('no');
		fireEvent.click(headers(container)[1]);
		expect(headers(container)[0].hasAttribute('data-hx-tab-active')).toBe(true);
	});

	it('renders the default grid body container', () => {
		const {container} = renderWithProvider(<HxTabs content={content}/>);
		expect(bodies(container)[0].hasAttribute('data-hx-grid')).toBe(true);
	});

	it('renders flex and block body containers on demand', () => {
		const flex = renderWithProvider(<HxTabs content={content} contentContainerType="flex"/>);
		expect(bodies(flex.container)[0].hasAttribute('data-hx-flex')).toBe(true);
		flex.unmount();

		const block = renderWithProvider(<HxTabs content={content} contentContainerType="block"/>);
		expect(bodies(block.container)[0].hasAttribute('data-hx-grid')).toBe(false);
		expect(bodies(block.container)[0].hasAttribute('data-hx-flex')).toBe(false);
	});

	it('propagates a nested model to headers and bodies', () => {
		const model = reactive({user: {name: 'Ada'}});
		const {container} = renderWithProvider(
			<HxTabs $model={model} $field="user"
			        content={[{mark: 'a', header: <HxLabel $field="name"/>, body: <HxLabel $field="name"/>}] as HxTabsChildren}/>
		);
		const labels = [...container.querySelectorAll<HTMLElement>('[data-hx-label]')]
			.filter(el => el.getAttribute('data-hx-model-path') === 'user.name');
		expect(labels.length).toBeGreaterThanOrEqual(2);
		labels.forEach(label => {
			expect(label.textContent).toBe('Ada');
		});
	});

	it('forwards ref to the root and marks the hidden state', () => {
		const ref = {current: null as HTMLDivElement | null};
		const {container} = renderWithProvider(<HxTabs content={content} $visible={false} ref={ref}/>);
		expect(queryByDataAttr(container, 'data-hx-tabs')!.getAttribute('data-hx-visible')).toBe('no');
		expect(ref.current).not.toBeNull();
		expect(ref.current!.hasAttribute('data-hx-tabs')).toBe(true);
	});
});
