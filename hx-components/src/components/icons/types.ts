import type {CSSProperties} from 'react';

export type SvgIconDataAttributeKey = Exclude<`data-hx-${string}`, 'data-hx-svg-icon'>;

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
