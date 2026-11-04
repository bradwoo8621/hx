import {reactive} from '@hx/data';
import {describe, expect, it} from 'vitest';
import {
	HxArticle,
	HxAside,
	HxBlockquote,
	HxCode,
	HxDd,
	HxDiv,
	HxDl,
	HxDt,
	HxFooter,
	HxFragment,
	HxH1,
	HxH2,
	HxH3,
	HxH4,
	HxH5,
	HxH6,
	HxHeader,
	HxLabel,
	HxLi,
	HxMain,
	HxNav,
	HxOl,
	HxP,
	HxPre,
	HxSection,
	HxSpan,
	HxUl,
	type HxObject
} from '../src';
import {queryByDataAttr, renderWithProvider} from './test-utils';

describe('PenetrableBasic tags', () => {
	const cases = [
		[HxMain, 'main'],
		[HxHeader, 'header'],
		[HxFooter, 'footer'],
		[HxNav, 'nav'],
		[HxAside, 'aside'],
		[HxSection, 'section'],
		[HxArticle, 'article'],
		[HxBlockquote, 'blockquote'],
		[HxDiv, 'div'],
		[HxSpan, 'span'],
		[HxH1, 'h1'],
		[HxH2, 'h2'],
		[HxH3, 'h3'],
		[HxH4, 'h4'],
		[HxH5, 'h5'],
		[HxH6, 'h6'],
		[HxP, 'p'],
		[HxPre, 'pre'],
		[HxCode, 'code'],
		[HxUl, 'ul'],
		[HxOl, 'ol'],
		[HxLi, 'li'],
		[HxDl, 'dl'],
		[HxDd, 'dd'],
		[HxDt, 'dt']
	] as const;

	it.each(cases.map(([Component, tag]) => [tag, Component] as const))('renders <%s>', (tag, Component) => {
		const {container} = renderWithProvider(<Component data-testid="el">content</Component>);
		const el = container.querySelector<HTMLElement>(`[data-testid="el"]`)!;
		expect(el.tagName.toLowerCase()).toBe(tag);
		expect(el.textContent).toBe('content');
	});

	it('forwards regular DOM attributes', () => {
		const {container} = renderWithProvider(<HxDiv id="target" className="host-class" title="tip"/>);
		const el = container.querySelector<HTMLElement>('#target')!;
		expect(el.classList.contains('host-class')).toBe(true);
		expect(el.title).toBe('tip');
	});
});

describe('HxFragment', () => {
	it('injects the model into child hx components', () => {
		const model = reactive({user: {name: 'Ada'}});
		const {container} = renderWithProvider(
			<HxFragment $model={model.user as HxObject<{ name: string }>}>
				<HxLabel $field="name"/>
			</HxFragment>
		);
		const label = queryByDataAttr(container, 'data-hx-label')!;
		expect(label.getAttribute('data-hx-model-path')).toBe('user.name');
		expect(label.textContent).toBe('Ada');
	});

	it('does not inject into native elements', () => {
		const model = reactive({value: 'x'});
		const {container} = renderWithProvider(
			<HxFragment $model={model}>
				<span data-testid="native"/>
				<HxLabel $field="value"/>
			</HxFragment>
		);
		expect(container.querySelector('[data-testid="native"]')!.hasAttribute('$model')).toBe(false);
		expect(queryByDataAttr(container, 'data-hx-label')!.textContent).toBe('x');
	});
});
