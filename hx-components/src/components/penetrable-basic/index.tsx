// @ts-expect-error import React
import React, {
	createElement,
	type DetailedHTMLProps,
	type HTMLAttributes,
	type ReactElement,
	type ReactNode,
	type RefAttributes
} from 'react';
import type {HxComponentDataProps, HxObject} from '../../types';
import {interposeToChildren} from '../../utils';

export const HxFragment = <T extends object>(props: { $model: HxObject<T>, children: ReactNode }) => {
	const {$model, children} = props;

	return <>
		{interposeToChildren({$model}, children)}
	</>;
};
HxFragment.displayName = 'HxFragment';

export type PenetrableBasicProps<T extends object, E, A extends HTMLAttributes<E>> =
	& Partial<HxComponentDataProps<T>>
	& DetailedHTMLProps<A, E>

export type PenetrableBasicType<E, A extends HTMLAttributes<E>> = <T extends object>(
	props: PenetrableBasicProps<T, E, A> & RefAttributes<E>
) => ReactElement;

export const PenetrableBasic = <E, A extends HTMLAttributes<E>>(tag: string) => {
	return (<T extends object>(props: PenetrableBasicProps<T, E, A>) => {
		const {$model, children, ...rest} = props;

		return createElement(tag, rest, interposeToChildren({$model}, children));
	}) as PenetrableBasicType<E, A>;
};

export const HxMain = PenetrableBasic<HTMLElement, HTMLAttributes<HTMLElement>>('main');
// @ts-expect-error assign component name
HxMain.displayName = 'HxMain';
export const HxHeader = PenetrableBasic<HTMLElement, HTMLAttributes<HTMLElement>>('header');
// @ts-expect-error assign component name
HxHeader.displayName = 'HxHeader';
export const HxFooter = PenetrableBasic<HTMLElement, HTMLAttributes<HTMLElement>>('footer');
// @ts-expect-error assign component name
HxFooter.displayName = 'HxFooter';
export const HxNav = PenetrableBasic<HTMLElement, HTMLAttributes<HTMLElement>>('nav');
// @ts-expect-error assign component name
HxNav.displayName = 'HxNav';
export const HxAside = PenetrableBasic<HTMLElement, HTMLAttributes<HTMLElement>>('aside');
// @ts-expect-error assign component name
HxAside.displayName = 'HxAside';

export const HxSection = PenetrableBasic<HTMLElement, HTMLAttributes<HTMLElement>>('section');
// @ts-expect-error assign component name
HxSection.displayName = 'HxSection';
export const HxArticle = PenetrableBasic<HTMLElement, HTMLAttributes<HTMLElement>>('article');
// @ts-expect-error assign component name
HxArticle.displayName = 'HxArticle';
export const HxBlockquote = PenetrableBasic<HTMLQuoteElement, HTMLAttributes<HTMLQuoteElement>>('blockquote');
// @ts-expect-error assign component name
HxBlockquote.displayName = 'HxBlockquote';
export const HxDiv = PenetrableBasic<HTMLDivElement, HTMLAttributes<HTMLDivElement>>('div');
// @ts-expect-error assign component name
HxDiv.displayName = 'HxDiv';
export const HxSpan = PenetrableBasic<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>('span');
// @ts-expect-error assign component name
HxSpan.displayName = 'HxSpan';

export const HxH1 = PenetrableBasic<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>('h1');
// @ts-expect-error assign component name
HxH1.displayName = 'HxH1';
export const HxH2 = PenetrableBasic<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>('h2');
// @ts-expect-error assign component name
HxH2.displayName = 'HxH2';
export const HxH3 = PenetrableBasic<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>('h3');
// @ts-expect-error assign component name
HxH3.displayName = 'HxH3';
export const HxH4 = PenetrableBasic<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>('h4');
// @ts-expect-error assign component name
HxH4.displayName = 'HxH4';
export const HxH5 = PenetrableBasic<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>('h5');
// @ts-expect-error assign component name
HxH5.displayName = 'HxH5';
export const HxH6 = PenetrableBasic<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>('h6');
// @ts-expect-error assign component name
HxH6.displayName = 'HxH6';
export const HxP = PenetrableBasic<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>('p');
// @ts-expect-error assign component name
HxP.displayName = 'HxP';
export const HxPre = PenetrableBasic<HTMLPreElement, HTMLAttributes<HTMLPreElement>>('pre');
// @ts-expect-error assign component name
HxPre.displayName = 'HxPre';
export const HxCode = PenetrableBasic<HTMLElement, HTMLAttributes<HTMLElement>>('code');
// @ts-expect-error assign component name
HxCode.displayName = 'HxCode';

export const HxUl = PenetrableBasic<HTMLUListElement, HTMLAttributes<HTMLUListElement>>('ul');
// @ts-expect-error assign component name
HxUl.displayName = 'HxUl';
export const HxOl = PenetrableBasic<HTMLOListElement, HTMLAttributes<HTMLOListElement>>('ol');
// @ts-expect-error assign component name
HxOl.displayName = 'HxOl';
export const HxLi = PenetrableBasic<HTMLLIElement, HTMLAttributes<HTMLLIElement>>('li');
// @ts-expect-error assign component name
HxLi.displayName = 'HxLi';
export const HxDl = PenetrableBasic<HTMLDListElement, HTMLAttributes<HTMLDListElement>>('dl');
// @ts-expect-error assign component name
HxDl.displayName = 'HxDl';
export const HxDd = PenetrableBasic<HTMLElement, HTMLAttributes<HTMLElement>>('dd');
// @ts-expect-error assign component name
HxDd.displayName = 'HxDd';
export const HxDt = PenetrableBasic<HTMLElement, HTMLAttributes<HTMLElement>>('dt');
// @ts-expect-error assign component name
HxDt.displayName = 'HxDt';
