import {reactive} from '@hx/data';
import {act} from 'react';
import {screen} from '@testing-library/react';
import {beforeEach, describe, expect, it} from 'vitest';
import {HxLabel, HxLC, StdHxLanguages, configHxLabel} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

beforeEach(() => {
	configHxLabel({valueUseI18N: false});
	StdHxLanguages.uninstall('en');
	HxLC.switchTo('en');
});

describe('HxLabel', () => {
	it('renders a span with the label marker and text', () => {
		const {container} = renderWithProvider(<HxLabel text="Hello"/>);
		const span = queryByDataAttr(container, 'data-hx-label');
		expect(span).not.toBeNull();
		expect(span!.tagName.toLowerCase()).toBe('span');
		expect(span!.textContent).toBe('Hello');
		expect(span!.getAttribute('data-hx-label-text')).toBe('Hello');
		expect(span!.getAttribute('data-hx-visible')).toBe('');
	});

	it('omits data-hx-label-text when text is empty', () => {
		const {container} = renderWithProvider(<HxLabel text=""/>);
		const span = queryByDataAttr(container, 'data-hx-label');
		expect(span!.hasAttribute('data-hx-label-text')).toBe(false);
	});

	it('keeps a caller supplied data-hx-label-text as fallback', () => {
		const {container} = renderWithProvider(<HxLabel text="" data-hx-label-text="fallback"/>);
		const span = queryByDataAttr(container, 'data-hx-label');
		expect(span!.getAttribute('data-hx-label-text')).toBe('fallback');
	});

	it('reads the leading escaped tilde as literal text', () => {
		renderWithProvider(<HxLabel text={'\\~literal'}/>);
		expect(screen.getByText('~literal')).toBeTruthy();
	});

	it('translates a registered i18n key', () => {
		StdHxLanguages.install('en', {greeting: 'Hello'});
		HxLC.switchTo('en');
		renderWithProvider(<HxLabel text="~greeting"/>);
		expect(screen.getByText('Hello')).toBeTruthy();
	});

	it('strips the i18n prefix of an unknown key and keeps the key as text', () => {
		renderWithProvider(<HxLabel text="~missing.key"/>);
		expect(screen.getByText('missing.key')).toBeTruthy();
	});

	it('reads the current model value on each render', async () => {
		const model = reactive({name: 'Ada'});
		const {container, rerender} = renderWithProvider(<HxLabel $model={model} $field="name"/>);
		const span = queryByDataAttr(container, 'data-hx-label');
		expect(span!.textContent).toBe('Ada');
		expect(span!.getAttribute('data-hx-model-path')).toBe('name');

		await act(async () => {
			model.name = 'Grace';
		});
		rerender(<HxLabel $model={model} $field="name"/>);
		expect(span!.textContent).toBe('Grace');
	});

	it('formats a model value with a predefined format code', () => {
		const model = reactive({amount: 1234.5});
		renderWithProvider(<HxLabel $model={model} $field="amount" format="nf2"/>);
		expect(screen.getByText('1,234.50')).toBeTruthy();
	});

	it('translates a model value when valueUseI18N is enabled', () => {
		StdHxLanguages.install('en', {status: 'Active'});
		HxLC.switchTo('en');
		const model = reactive({status: 'status'});
		renderWithProvider(<HxLabel $model={model} $field="status" valueUseI18N/>);
		expect(screen.getByText('Active')).toBeTruthy();
	});

	it('marks hidden and disabled states on the DOM', () => {
		const {container} = renderWithProvider(<HxLabel text="x" $visible={false} $disabled/>);
		const span = queryByDataAttr(container, 'data-hx-label');
		expect(span!.getAttribute('data-hx-visible')).toBe('no');
		expect(span!.getAttribute('data-hx-disabled')).toBe('');
	});

	it('maps state and style props to data attributes', () => {
		const {container} = renderWithProvider(
			<HxLabel text="x"
			         color="danger"
			         paddingX="sm"
			         opaque
			         clickable
			         hoverable
			         hovered
			         active
			         indent/>
		);
		const span = queryByDataAttr(container, 'data-hx-label')!;
		expect(span.getAttribute('data-hx-color')).toBe('danger');
		expect(span.getAttribute('data-hx-padding-x')).toBe('sm');
		expect(span.getAttribute('data-hx-label-opaque')).toBe('');
		expect(span.getAttribute('data-hx-label-clickable')).toBe('');
		expect(span.getAttribute('data-hx-label-hoverable')).toBe('');
		expect(span.getAttribute('data-hx-hover')).toBe('');
		expect(span.getAttribute('data-hx-label-active')).toBe('');
		expect(span.getAttribute('data-hx-label-text-indent')).toBe('');
	});

	it('does not emit false boolean props as empty attributes', () => {
		const {container} = renderWithProvider(<HxLabel text="x" opaque={false} clickable={false}/>);
		const span = queryByDataAttr(container, 'data-hx-label')!;
		expect(span.hasAttribute('data-hx-label-opaque')).toBe(false);
		expect(span.hasAttribute('data-hx-label-clickable')).toBe(false);
	});

	it('renders React element text and exposes its label text', () => {
		const {container} = renderWithProvider(
			<HxLabel text={<i data-hx-label-text="Custom">ignored</i>}/>
		);
		const span = queryByDataAttr(container, 'data-hx-label')!;
		expect(span.getAttribute('data-hx-label-text')).toBe('Custom');
		expect(span.querySelector('i')!.textContent).toBe('ignored');
	});

	it('forwards className and ref to the span', () => {
		const ref = {current: null as HTMLSpanElement | null};
		renderWithProvider(<HxLabel text="x" className="host-class" ref={ref}/>);
		expect(ref.current).not.toBeNull();
		expect(ref.current!.tagName.toLowerCase()).toBe('span');
		expect(ref.current!.classList.contains('host-class')).toBe(true);
	});
});
