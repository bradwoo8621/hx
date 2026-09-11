import type {HxContext} from '../contexts';
import type {HxDomDataAttrName, HxObject} from '../types';
import {HxConsole} from './browser';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HxProps = Record<string, any>;
export type ComputedHxDataAttributes = Record<HxDomDataAttrName, string | number | boolean | null | undefined>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HxDataAttributeValueComputeFunc = (value: any) => string | null | undefined;

const CommonHxDataAttributes = {
	color: 'data-hx-color',
	hovered: 'data-hx-hover',
	border: 'data-hx-border',
	borderRadius: 'data-hx-border-radius',
	minWidth: 'data-hx-min-width',
	width: 'data-hx-width',
	maxWidth: 'data-hx-max-width',
	minHeight: 'data-hx-min-height',
	height: 'data-hx-height',
	maxHeight: 'data-hx-max-height',
	paddingX: 'data-hx-padding-x',
	paddingY: 'data-hx-padding-y',
	paddingT: 'data-hx-padding-t',
	paddingB: 'data-hx-padding-b',
	marginX: 'data-hx-margin-x',
	marginY: 'data-hx-margin-y',
	marginT: 'data-hx-margin-t',
	marginR: 'data-hx-margin-r',
	marginB: 'data-hx-margin-b',
	marginL: 'data-hx-margin-l',
	// flex and grid container
	alignItems: 'data-hx-align-items',
	alignContent: 'data-hx-align-content',
	justifyItems: 'data-hx-justify-items',
	justifyContent: 'data-hx-justify-content',
	gapX: 'data-hx-cell-gap-x',
	gapY: 'data-hx-cell-gap-y',
	// flex cell
	fGrow: 'data-hx-flex-cell-grow',
	fAlignSelf: 'data-hx-align-self',
	// grid cell
	gRow: 'data-hx-grid-cell-row',
	gRows: 'data-hx-grid-cell-rows',
	gCol: 'data-hx-grid-cell-col',
	gCols: 'data-hx-grid-cell-cols',
	gAlignSelf: 'data-hx-align-self',
	gJustifySelf: 'data-hx-justify-self',
	visible: ['data-hx-visible', (value => {
		const v = value ?? true;
		return v === false ? 'no' : '';
	}) as HxDataAttributeValueComputeFunc],
	disabled: ['data-hx-disabled', (value => {
		const v = value ?? false;
		return (v === true || v === '') ? '' : (void 0);
	}) as HxDataAttributeValueComputeFunc],
	readonly: ['data-hx-readonly', (value => {
		const v = value ?? false;
		return (v === true || v === '') ? '' : (void 0);
	}) as HxDataAttributeValueComputeFunc]
} as const;

/**
 * Maps the props of one component to its `data-*` attributes, keyed by the name passed to
 * `create()` and looked up by `HxDataAttributesUtils.compute()`.
 *
 * Registration methods, by where the value comes from:
 * - `attr` / `attrs`: the prop key is the attribute name itself, for an attribute a component
 *   only forwards from its parent, e.g. `attrs('data-hx-label-svg-icon')` reads
 *   `props['data-hx-label-svg-icon']`.
 * - `propsAsIs`: the prop key is the component prop and its value becomes the attribute value,
 *   e.g. `propsAsIs({opaque: 'data-hx-label-opaque'})` reads `props.opaque`; the attribute name
 *   itself is accepted as a fallback key, so a parent may pass the attribute directly.
 * - `prop` / `props`: the same lookup as `propsAsIs`, but the value runs through the given
 *   compute function.
 * - `and`: registers entries from the shared `CommonHxDataAttributes` map. The constructor
 *   already does this for the common set, so a component only adds its own on top.
 *
 * A value that is a function is called with `(model, context)` first, so an attribute can be
 * derived from the reactive model. `DefaultComputeFunc` then normalises the result: `true`
 * becomes an empty attribute value, `false` and `null` / `undefined` drop the attribute
 * entirely, and anything else is stringified.
 *
 * Any `data-*` prop the component did not register is emitted unchanged, so a component does
 * not have to register the attributes it merely forwards.
 *
 * `trimOffKeys()` is the counterpart used when exposing props to the DOM: it keeps the props
 * this computer did not consume.
 */
export class HxDataPropToAttrValueComputer {
	static readonly DefaultComputeFunc: HxDataAttributeValueComputeFunc = (value) => {
		if (value == null) {
			return (void 0);
		} else if (value === true) {
			return '';
		} else if (value === false) {
			return (void 0);
		} else if (typeof value === 'string') {
			return value;
		} else {
			return String(value);
		}
	};

	private readonly uniqueKey: string;
	private readonly attrsOfFuncs: Record<HxDomDataAttrName, HxDataAttributeValueComputeFunc> = {};
	private readonly propsOfDefaultFuncs: Record<string, HxDomDataAttrName> = {};
	private readonly propsOfFuncs: Record<string, [HxDomDataAttrName, HxDataAttributeValueComputeFunc]> = {};

	private constructor(uniqueKey: string) {
		this.uniqueKey = uniqueKey;
		this.and('visible', 'disabled', 'readonly')
			.andSize()
			.andCellPosition()
			.andBorder();
	}

	static create(uniqueKey: string): HxDataPropToAttrValueComputer {
		return new HxDataPropToAttrValueComputer(uniqueKey);
	}

	getUniqueKey(): string {
		return this.uniqueKey;
	}

	attr(name: HxDomDataAttrName, to: HxDataAttributeValueComputeFunc): this {
		return this.attrs([name], to);
	}

	attrs(names: Array<HxDomDataAttrName>, to: HxDataAttributeValueComputeFunc): this {
		names.forEach(attr => {
			this.attrsOfFuncs[attr] = to;
		});
		return this;
	}

	propsAsIs(map: { [key: string]: HxDomDataAttrName }): this {
		Object.keys(map).forEach(prop => {
			const attr = map[prop];
			delete this.attrsOfFuncs[attr];
			delete this.propsOfFuncs[prop];
			this.propsOfDefaultFuncs[prop] = attr;
		});
		return this;
	}

	prop(name: string, attrName: HxDomDataAttrName, to: HxDataAttributeValueComputeFunc): this {
		return this.props({[name]: attrName}, to);
	}

	props(map: { [key: string]: HxDomDataAttrName }, to: HxDataAttributeValueComputeFunc): this {
		Object.keys(map).forEach(prop => {
			const attr = map[prop];
			delete this.attrsOfFuncs[attr];
			delete this.propsOfDefaultFuncs[prop];
			this.propsOfFuncs[prop] = [attr, to];
		});
		return this;
	}

	and(
		name: keyof typeof CommonHxDataAttributes,
		...names: Array<keyof typeof CommonHxDataAttributes>
	): this {
		for (const nameOfAttrOrProp of [name, ...names]) {
			// @ts-expect-error ignore check
			const value: HxDataAttributeValueComputeFunc | HxDomDataAttrName | [HxDomDataAttrName, HxDataAttributeValueComputeFunc] = CommonHxDataAttributes[nameOfAttrOrProp];
			if (typeof value === 'function') {
				// value is function -> key is data-hx-*
				this.attr(nameOfAttrOrProp as HxDomDataAttrName, value);
			} else if (typeof value === 'string') {
				// value is a data-hx-* attr name
				this.propsAsIs({[nameOfAttrOrProp]: value});
			} else {
				// value is [data-hx-*, func]
				this.prop(nameOfAttrOrProp, value[0], value[1]);
			}
		}

		return this;
	}

	private andSize(): this {
		return this.and(
			'minWidth', 'width', 'maxWidth',
			'minHeight', 'height', 'maxHeight',
			'paddingX', 'paddingY', 'paddingT', 'paddingB',
			'marginX', 'marginY', 'marginT', 'marginR', 'marginB', 'marginL'
		);
	}

	private andCellPosition(): this {
		return this.and(
			'fGrow', 'fAlignSelf',
			'gCol', 'gCols', 'gRow', 'gRows', 'gAlignSelf', 'gJustifySelf'
		);
	}

	private andBorder(): this {
		return this.and('border', 'borderRadius');
	}

	register(): void {
		HxDataAttributesUtils.register(this);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private computeAttrValue<T>(props: HxProps, key: HxDomDataAttrName, model: HxObject<T> | undefined, context: HxContext, defaultProps?: HxProps, propKey?: string): any {
		let value = props[key];
		if (typeof value === 'function') {
			value = value(model, context);
		}
		if (value != null) {
			return value;
		} else if (propKey != null) {
			return value ?? defaultProps?.[propKey] ?? defaultProps?.[key];
		} else {
			return value ?? defaultProps?.[key];
		}
	}

	compute<T>(props: HxProps, model: HxObject<T> | undefined, context: HxContext, defaultProps?: HxProps): ComputedHxDataAttributes {
		const computed: ComputedHxDataAttributes = {};

		const used: Array<HxDomDataAttrName> = [];
		Object.keys(this.attrsOfFuncs).forEach(key => {
			const attr = key as HxDomDataAttrName;
			const value = this.attrsOfFuncs[attr](this.computeAttrValue(props, attr, model, context, defaultProps));
			if (value != null) {
				computed[attr] = value;
			}
			used.push(attr);
		});
		Object.keys(this.propsOfDefaultFuncs).forEach(prop => {
			const attr = this.propsOfDefaultFuncs[prop];
			const value = HxDataPropToAttrValueComputer.DefaultComputeFunc(props[prop] ?? this.computeAttrValue(props, attr, model, context, defaultProps, prop));
			if (value != null) {
				computed[attr] = value;
			}
			used.push(attr);
		});
		Object.keys(this.propsOfFuncs).forEach(prop => {
			const [attr, func] = this.propsOfFuncs[prop];
			const value = func(props[prop] ?? this.computeAttrValue(props, attr, model, context, defaultProps, prop));
			if (value != null) {
				computed[attr] = value;
			}
			used.push(attr);
		});
		Object.keys(props).forEach(key => {
			if (!key.startsWith('data-') || used.includes(key as HxDomDataAttrName)) {
				return;
			}
			const value = HxDataPropToAttrValueComputer.DefaultComputeFunc(this.computeAttrValue(props, key as HxDomDataAttrName, model, context));
			if (value != null) {
				computed[key as HxDomDataAttrName] = value;
			}
		});

		return computed;
	}

	trimOffKeys<P extends object, T extends object>(props: P): T {
		return Object.keys(props).reduce((target, key) => {
			if (!key.startsWith('data-')
				&& this.propsOfDefaultFuncs[key] == null && this.propsOfFuncs[key] == null) {
				// @ts-expect-error ignore type check
				target[key] = props[key];
			}
			return target;
		}, {} as T);
	}
}

export class HxDataAttributesUtils {
	private static readonly Computers: Map<string, HxDataPropToAttrValueComputer> = new Map();

	static register(valueComputer: HxDataPropToAttrValueComputer): void {
		HxDataAttributesUtils.Computers.set(valueComputer.getUniqueKey(), valueComputer);
	}

	static compute<T>(props: HxProps, model: HxObject<T> | undefined, context: HxContext, uniqueKey: string, defaultProps?: HxProps): ComputedHxDataAttributes {
		const computer = HxDataAttributesUtils.Computers.get(uniqueKey);
		if (computer == null) {
			HxConsole.warn(`Hx component key[${uniqueKey}] not found.`);
			return {};
		} else {
			return computer.compute(props, model, context, defaultProps);
		}
	}

	static trimOffKeys<P extends object, T extends object>(props: P, uniqueKey: string): T {
		const computer = HxDataAttributesUtils.Computers.get(uniqueKey);
		if (computer == null) {
			return props as unknown as T;
		} else {
			return computer.trimOffKeys(props);
		}
	}
}

export const HxCommonDataPropToAttrValueComputerKey = 'HxCommon';
HxDataPropToAttrValueComputer.create(HxCommonDataPropToAttrValueComputerKey).register();
