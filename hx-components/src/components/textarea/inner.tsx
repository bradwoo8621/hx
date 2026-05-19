import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ChangeEventHandler,
	type ForwardedRef,
	forwardRef,
	type ReactElement,
	type RefAttributes,
	useEffect,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useDelayedFunc, useDualRef} from '../../hooks';
import {exposePropsToDOM, isSameStr, pickCommonProps} from '../../utils';
import {
	createHxInputBlurHandler,
	createHxInputFocusHandler,
	createHxInputKeyDownHandler,
	useHxInputCompositionHandlers
} from '../input';
import {HxLabel} from '../label';
import {HxCheckMessage} from '../with-check';
import {HxTextareaDefaults} from './defaults';
import type {HxTextareaInnerProps} from './types';

export type HxTextareaInnerType = <T extends object>(
	props: HxTextareaInnerProps<T> & RefAttributes<HTMLTextAreaElement>
) => ReactElement | null;

export const HxTextareaInner =
	forwardRef(<T extends object>(props: HxTextareaInnerProps<T>, ref: ForwardedRef<HTMLTextAreaElement>) => {
		const {
			$model, $field,
			selectAll = HxTextareaDefaults.selectAll, autoRows,
			rows = HxTextareaDefaults.rows, resize = HxTextareaDefaults.resize,
			placeholder, charLimit,
			emitChangeOnBlur = HxTextareaDefaults.emitChangeOnBlur,
			emitChangeDelay: ecd = HxTextareaDefaults.emitChangeDelay,
			name, onFocus, onBlur, onChange, onKeyDown, onCompositionStart, onCompositionEnd,
			$domBox,
			// for check
			$withCheck, $check, alwaysKeepMessageDOM, $supplyOn,
			$domCheckBox, $domCheckMsg,
			...rest
		} = props;

		/** Normalized emit change delay (clamped to non-negative value) */
		const emitChangeDelay = ecd < 0 ? 0 : ecd;

		/** HX context providing theme, i18n, and forceUpdate functionality */
		const context = useHxContext();
		/** Reactive state for visibility, disabled, and readonly props */
		const {visible, disabled, readonly} = useDataMonitor(props);
		/**
		 * Stores the last committed value to avoid duplicate change events
		 * Used to compare against current value when emitting change events
		 */
		const valueBeforeEmitRef = useRef<string | undefined>(ERO.getValue($model, $field));
		/**
		 * Tracks IME composition state for multi-bytes character input (e.g. Chinese, Japanese, Korean)
		 * @property enabled - Whether composition is currently active (user is in middle of typing a multi-bytes character)
		 * @property text - Temporary text buffer for composition input
		 */
		const compositionRef = useRef({enabled: false, text: ''});
		const textareaRef = useDualRef(ref);
		/** Debounce function for delayed model updates */
		const {delay} = useDelayedFunc(emitChangeDelay);
		/**
		 * Auto height adjustment effect that runs on every render
		 * Dynamically adjusts textarea height to fit content when autoRows is enabled.
		 * Respects max-height constraints set via CSS or autoRows number value.
		 *
		 * Implementation logic:
		 * 1. Temporarily set height to 'auto' to calculate actual scroll height
		 * 2. Calculate total height including borders
		 * 3. Apply new height, capped at max-height if specified
		 * 4. Only update DOM if height actually changed to avoid layout thrashing
		 */
		useEffect(() => {
			const autoHeight = autoRows === true || (typeof autoRows === 'number' && autoRows > rows);
			if (autoHeight) {
				const el = textareaRef.current;
				if (el == null) {
					return;
				}
				// Reset height to auto to get accurate scroll height measurement
				el.style.height = 'auto';
				// Calculate border height (offsetHeight includes borders, clientHeight doesn't)
				const borderHeight = el.offsetHeight - el.clientHeight;
				const scrollHeight = el.scrollHeight;
				const {maxHeight} = getComputedStyle(el);
				// Calculate new height, capped at max-height if set
				const height = Math.min(scrollHeight + borderHeight, parseInt(maxHeight) || Infinity);
				// Only update if height actually changed to avoid unnecessary layout reflows
				el.style.height = `${height}px`;
			}
		});

		/** Focus event handler - handles select-all behavior and propagates to custom handler */
		const onTextareaFocus = createHxInputFocusHandler({$model, selectAll, onFocus, context});
		/**
		 * Commits the current textarea value to the model and triggers change event.
		 * Shared reusable logic for both blur and Enter key events to ensure consistent behavior.
		 * Handles value comparison, model update, and event emission.
		 *
		 * @param currentValue - The current textarea value to commit
		 */
		const commitCurrentValue = (currentValue: string) => {
			let targetValue: string | undefined = currentValue;
			if (targetValue.length === 0) {
				targetValue = (void 0);
			}
			const value = ERO.getValue($model, $field);
			const oldValue = valueBeforeEmitRef.current;
			if (isSameStr(value, targetValue)) {
				// Value in model already matches textarea value, no need to update model
				valueBeforeEmitRef.current = value;
				if (!isSameStr(oldValue, value)) {
					// Only emit event if value actually changed from last committed value
					valueBeforeEmitRef.current = value;
					ERO.emit($model, $field, oldValue, value);
				}
			} else {
				// Value differs between textarea and model, sync and emit event
				// 1. Update the reference tracking last committed value
				valueBeforeEmitRef.current = targetValue;
				// 2. Update model silently to avoid duplicate automatic events
				ERO.setValueSilent($model, $field, targetValue);
				// 3. Manually emit change event with correct old/new value pair
				ERO.emit($model, $field, oldValue, targetValue);
			}
		};

		/**
		 * Core text change handler that processes input updates according to configured update mode.
		 * Handles IME composition input, local value updates, and model synchronization with debounce.
		 *
		 * @param text - The new current text value from the textarea
		 *
		 * @behavior
		 * - Composition mode: only update local composition buffer, do not sync to model
		 * - Blur mode: update model locally without emitting events, defer event to blur/Enter
		 * - Debounce mode: update model silently, schedule event emission after debounce delay
		 * - Immediate mode: update model and emit event immediately
		 */
		const onTextValueChange = (text: string) => {
			let value: string | undefined = text;
			if (value.length === 0) {
				value = (void 0);
			}
			if (compositionRef.current.enabled) {
				// composition mode: only update temporary buffer, don't sync to model yet
				compositionRef.current.text = text;
			} else {
				if (emitChangeOnBlur) {
					// Blur-only mode: update local model value but don't emit change event yet
					// Mute leaf event to avoid triggering unnecessary re-renders
					ERO.setValueSilent($model, $field, value, 'mute-leaf');
				} else if (emitChangeDelay > 0) {
					// Debounced mode: update local model immediately but defer event emission
					// Mute leaf event to avoid duplicate events when debounce triggers
					ERO.setValueSilent($model, $field, value, 'mute-leaf');
					delay('input-change', async () => {
						const oldValue = valueBeforeEmitRef.current;
						valueBeforeEmitRef.current = value;
						// Emit change event after debounce delay
						ERO.emit($model, $field, oldValue, value);
					});
				} else {
					// Immediate mode: update model and emit change event immediately
					valueBeforeEmitRef.current = value;
					ERO.setValue($model, $field, value);
				}
			}

			context.forceUpdate();
		};
		/**
		 * Handle textarea value changes
		 * Behavior differs based on emitChangeOnBlur prop:
		 * - true: only update local display value, defer model update to blur event
		 * - false: debounce model update using emitChangeDelay
		 */
		const onTextareaChange: ChangeEventHandler<HTMLTextAreaElement> = (ev) => {
			onTextValueChange(ev.target.value);
			onChange?.(ev, $model, context);
		};
		// eslint-disable-next-line react-hooks/refs
		const onTextareaKeyDown = createHxInputKeyDownHandler({
			$model, context, onKeyDown, emitChangeOnBlur, commitCurrentValue
		});
		const {
			onCompositionStart: onTextareaCompositionStart, onCompositionEnd: onTextareaCompositionEnd
		} = useHxInputCompositionHandlers({
			$model, context, onCompositionStart, onCompositionEnd, compositionRef, onTextValueChange
		});
		// eslint-disable-next-line react-hooks/refs
		const onTextareaBlur = createHxInputBlurHandler({
			$model, context, onBlur, emitChangeOnBlur, commitCurrentValue
		});

		const $wrapper = {...($domBox ?? $domCheckBox), ...pickCommonProps(rest)};
		const wrapperProps = exposePropsToDOM($wrapper, $model, context);
		// eslint-disable-next-line react-hooks/refs
		const value = (compositionRef.current.enabled ? compositionRef.current.text : ERO.getValue($model, $field)) ?? '';
		/** Processed props with reactive values exposed as DOM data attributes */
		const {style, ...restProps} = exposePropsToDOM(rest, $model, context);
		const textStyle = {
			...style,
			'--textarea-rows': rows,
			'--textarea-max-rows': typeof autoRows === 'number' ? autoRows : (void 0)
		};
		const showPlaceholder = !disabled && !readonly
			&& placeholder != null && (typeof placeholder !== 'string' || placeholder.trim().length !== 0);
		const showCharLimit = !disabled && !readonly && charLimit != null && charLimit > 0;
		// eslint-disable-next-line react-hooks/refs
		const currentCharCount = value == null ? 0 : `${value}`.length;

		return <div {...wrapperProps}
		            data-hx-textarea-box=""
		            data-hx-with-check={$withCheck ? '' : (void 0)}
		            data-hx-visible={(visible ?? true) ? '' : 'no'}
		            data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
		            data-hx-readonly={(readonly ?? false) ? '' : (void 0)}>
			<textarea {...restProps}
			          name={name ?? ERO.pathOf($model, $field)}
				// eslint-disable-next-line react-hooks/refs
				      value={value}
				      onChange={onTextareaChange}
				      onFocus={onTextareaFocus} onBlur={onTextareaBlur} onKeyDown={onTextareaKeyDown}
				      onCompositionStart={onTextareaCompositionStart} onCompositionEnd={onTextareaCompositionEnd}
				      data-hx-textarea=""
				      data-hx-model-path={ERO.pathOf($model, $field)}
				      data-hx-textarea-rows=""
				      data-hx-textarea-max-rows={(autoRows === true || (typeof autoRows === 'number' && autoRows > rows)) ? '' : (void 0)}
				      data-hx-textarea-resize={resize}
				      data-hx-disabled={(disabled ?? false) ? '' : (void 0)} disabled={disabled ?? false}
				      data-hx-readonly={(readonly ?? false) ? '' : (void 0)} readOnly={readonly ?? false}
				      style={textStyle}
				      ref={textareaRef}/>
			{showPlaceholder
				? <HxLabel $model={$model} text={placeholder} data-hx-textarea-placeholder=""/>
				: (void 0)}
			{$withCheck
				? <HxCheckMessage {...$domCheckMsg} $model={$model}
					// @ts-expect-error ignore the generic type check
					              $check={$check}
					              $checkProps={props}
					// @ts-expect-error ignore the generic type check
					              $supplyOn={$supplyOn}
					              alwaysKeepMessageDOM={alwaysKeepMessageDOM}/>
				: (void 0)}
			{showCharLimit
				? <HxLabel text={`${currentCharCount} / ${charLimit}`}
				           data-hx-label-textarea-char-limit=""/>
				: (void 0)}
		</div>;
	}) as unknown as HxTextareaInnerType;
// @ts-expect-error assign component name
HxTextareaInner.displayName = 'HxTextareaInner';
