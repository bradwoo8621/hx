export type SvgIconDataAttributeKey = Exclude<`data-hx-${string}`, 'data-hx-svg-icon'>;

export interface SvgIconDefaultProps {
	width: number;
	height: number;
	viewBox: string;
	fill: string;
	xmlns: string;
	'data-hx-svg-icon': '';
	[key: SvgIconDataAttributeKey]: string | bigint | number | boolean;
}

export interface IconProps {
	[key: SvgIconDataAttributeKey]: string | bigint | number | boolean;
}
