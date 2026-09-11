import type {CSSProperties} from 'react';
import type {HxDomDataAttrName} from '../../types';

export type SvgIconDataAttributeKey = Exclude<HxDomDataAttrName, 'data-hx-svg-icon' | 'data-hx-svg-icon-name'>;

export interface SvgIconDefaultProps {
	width: number;
	height: number;
	viewBox: string;
	fill: string;
	xmlns: string;
	'data-hx-svg-icon': '';
	style?: CSSProperties;
	[key: SvgIconDataAttributeKey]: string | bigint | number | boolean;
}

export interface IconProps {
	marginT?: number;
	marginR?: number;
	marginB?: number;
	marginL?: number;
	style?: CSSProperties;
	[key: SvgIconDataAttributeKey]: string | bigint | number | boolean;
}
