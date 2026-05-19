// noinspection DuplicatedCode

import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ChangeEventHandler,
	type ForwardedRef,
	forwardRef,
	type ReactElement,
	type RefAttributes,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor} from '../../hooks';
import {exposePropsToDOM} from '../../utils';
import {HxInputDefaults} from './defaults';
import {useHxInputCompositionHandlers, useHxInputValueChangeAndCommit} from './hooks';
import type {HxInputInnerProps} from './types';
import {
	createHxInputBlurHandler,
	createHxInputFocusHandler,
	createHxInputKeyDownHandler,
	type HxInputCompositionState
} from './utils';

export type HxInputInnerType = <T extends object>(
	props: HxInputInnerProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;
/**
 * Reactive input component with two-way data binding to hx-data models.
 * Supports both immediate debounced updates and blur-only update modes.
 *
 * @example
 * ```tsx
 * // Default: debounced updates after 100ms of inactivity
 * <HxInput $model={userModel} $field="username" />
 * ```
 *
 * @example
 * ```tsx
 * // Blur-only mode: update only when input loses focus or Enter is pressed
 * <HxInput $model={formModel} $field="email" emitChangeOnBlur />
 * ```
 *
 * @example
 * ```tsx
 * // Custom debounce delay: 300ms
 * <HxInput $model={searchModel} $field="query" emitChangeDelay={300} />
 * ```
 *
 * @features
 * - Automatic two-way binding to reactive data models
 * - Two update modes: debounced (default) and blur-only
 * - Enter key commit support in blur mode
 * - Select-all text on focus option
 * - Built-in disabled/readonly/visible state management
 * - Supports both text and password input types
 */
export const HxInputInner =
	forwardRef(<T extends object>(props: HxInputInnerProps<T>, ref: ForwardedRef<HTMLInputElement>) => {
		const {
			$model, $field,
			selectAll = HxInputDefaults.selectAll,
			emitChangeOnBlur = HxInputDefaults.emitChangeOnBlur,
			emitChangeDelay: ecd = HxInputDefaults.emitChangeDelay,
			name, onFocus, onBlur, onChange, onKeyDown, onCompositionStart, onCompositionEnd, ...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled, readonly} = useDataMonitor(props);
		const compositionRef = useRef<HxInputCompositionState>({enabled: false, text: ''});

		const {commitCurrentValue, onTextValueChange} = useHxInputValueChangeAndCommit({
			$model, $field, emitChangeOnBlur, emitChangeDelay: ecd < 0 ? 0 : ecd, context, compositionRef
		});

		const onInputFocus = createHxInputFocusHandler({$model, selectAll, onFocus, context});
		const onInputChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
			onTextValueChange(ev.target.value);
			onChange?.(ev, $model, context);
		};
		const onInputKeyDown = createHxInputKeyDownHandler({
			$model, context, onKeyDown, emitChangeOnBlur, commitCurrentValue
		});
		const {
			onCompositionStart: onInputCompositionStart, onCompositionEnd: onInputCompositionEnd
		} = useHxInputCompositionHandlers({
			$model, context, onCompositionStart, onCompositionEnd, compositionRef, onTextValueChange
		});
		const onInputBlur = createHxInputBlurHandler({
			$model, context, onBlur, emitChangeOnBlur, commitCurrentValue
		});

		// eslint-disable-next-line react-hooks/refs
		const value = (compositionRef.current.enabled ? compositionRef.current.text : ERO.getValue($model, $field)) ?? '';
		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = exposePropsToDOM(rest, $model, context);

		return <input {...restProps}
		              name={name ?? ERO.pathOf($model, $field)} type={rest.type ?? 'text'}
			// eslint-disable-next-line react-hooks/refs
			          value={value}
			          onChange={onInputChange}
			          onFocus={onInputFocus} onBlur={onInputBlur} onKeyDown={onInputKeyDown}
			          onCompositionStart={onInputCompositionStart} onCompositionEnd={onInputCompositionEnd}
			          data-hx-input=""
			          data-hx-model-path={ERO.pathOf($model, $field)}
			          data-hx-visible={(visible ?? true) ? '' : 'no'}
			          data-hx-disabled={(disabled ?? false) ? '' : (void 0)} disabled={disabled ?? false}
			          data-hx-readonly={(readonly ?? false) ? '' : (void 0)} readOnly={readonly ?? false}
			          ref={ref}/>;
	}) as unknown as HxInputInnerType;
// @ts-expect-error assign component name
HxInputInner.displayName = 'HxInputInner';
