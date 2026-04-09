import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ChangeEventHandler,
	type CompositionEventHandler,
	type FocusEventHandler,
	type ForwardedRef,
	forwardRef,
	type HTMLAttributes,
	type KeyboardEventHandler,
	type PropsWithoutRef,
	type ReactElement,
	type ReactNode,
	type RefAttributes,
	type TextareaHTMLAttributes,
	useEffect,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {type CheckPropSuppliedOn, useDataMonitor, useDelayedFunc, useDualRef} from '../../hooks';
import type {
	EditSingleFieldProps,
	HtmlElementProps,
	HxDirection,
	HxHtmlElementProps,
	HxOmittedAttributes,
	HxWrappedReactEvents,
	ReadonlyProps,
	WidthConstrainedProps
} from '../../types';
import {exposePropsToDOM, isSameStr} from '../../utils';
import {HxLabel} from '../label';
import {HxWithCheck, type HxWithCheckCreateOptions, type HxWithCheckProps} from '../with-check';
import {HxTextareaDefaults} from './defaults';

/**
 * Textarea resize behavior options
 * - none: no resize allowed (default)
 * - horizontal: allow horizontal resize only
 * - vertical: allow vertical resize only
 * - both: allow both horizontal and vertical resize
 */
export type HxTextareaResize = 'none' | 'both' | HxDirection;

/**
 * Extended props for HxTextarea component
 * Includes all standard form field props plus textarea-specific configuration
 */
export interface HxExtTextareaProps<T extends object>
	extends EditSingleFieldProps<T>, ReadonlyProps<T>, WidthConstrainedProps {
	/** Whether to automatically select all text when textarea receives focus */
	selectAll?: boolean;
	/** Resize behavior control - determines if and how user can resize the textarea */
	resize?: HxTextareaResize;
	placeholder?: ReactNode;
	/** Number of visible text rows (minimum 2, default from global settings) */
	rows?: number;
	/**
	 * Auto height according to input text.
	 * Specify a max rows if a number is given.
	 */
	autoRows?: boolean | number;
	/** Whether to show the remain/max char count */
	charLimit?: number;
	/**
	 * When true, updates the model value only when textarea loses focus or Enter key is pressed.
	 * When false, updates model after emitChangeDelay milliseconds of inactivity.
	 */
	emitChangeOnBlur?: boolean;
	/**
	 * Delay in milliseconds before committing value to model when emitChangeOnBlur is false.
	 * Negative values will be clamped to 0.
	 */
	emitChangeDelay?: number;
	/** Additional HTML attributes to apply to the box div element */
	$box?: HxWrappedReactEvents<HtmlElementProps<HTMLDivElement, HTMLAttributes<HTMLDivElement>>, T>;
}

/**
 * HTML attributes that are omitted from base props to avoid conflicts
 * These properties are controlled directly by the component and should not be passed directly
 */
export type OmittedTextareaHTMLProps =
	| HxOmittedAttributes
	| 'disabled' | 'value' | 'placeholder'
	// validation attributes
	| 'minLength' | 'maxLength' | 'required'
	| 'rows' | 'cols' | 'wrap'
	| 'readOnly'
	| 'children';

export type HxTextareaProps<T extends object> = PropsWithoutRef<
	& HxExtTextareaProps<T>
	& HxHtmlElementProps<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>, OmittedTextareaHTMLProps, T>
>;

export type HxTextareaType = <T extends object>(
	props: HxTextareaProps<T> & RefAttributes<HTMLTextAreaElement>
) => ReactElement | null;

/**
 * Reactive textarea component with two-way data binding to hx-data models.
 * Supports both immediate debounced updates and blur-only update modes.
 *
 * @example
 * ```tsx
 * // Default: debounced updates after 100ms of inactivity
 * <HxTextarea $model={userModel} $field="username" />
 * ```
 *
 * @example
 * ```tsx
 * // Blur-only mode: update only when textarea loses focus or Enter is pressed
 * <HxTextarea $model={formModel} $field="email" emitChangeOnBlur />
 * ```
 *
 * @example
 * ```tsx
 * // Custom debounce delay: 300ms
 * <HxTextarea $model={searchModel} $field="query" emitChangeDelay={300} />
 * ```
 *
 * @features
 * - Automatic two-way binding to reactive data models
 * - Two update modes: debounced (default) and blur-only
 * - Enter key commit support in blur mode
 * - Select-all text on focus option
 * - Configurable resize behavior (none/horizontal/vertical/both)
 * - Built-in disabled/readonly/visible state management
 * - Configurable number of visible rows
 */
export const HxTextarea =
	forwardRef(<T extends object>(props: HxTextareaProps<T>, ref: ForwardedRef<HTMLTextAreaElement>) => {
		const {
			$model, $field,
			selectAll = HxTextareaDefaults.selectAll, autoRows,
			rows = HxTextareaDefaults.rows, resize = HxTextareaDefaults.resize,
			placeholder, charLimit,
			emitChangeOnBlur = HxTextareaDefaults.emitChangeOnBlur,
			emitChangeDelay: ecd = HxTextareaDefaults.emitChangeDelay,
			name, onFocus, onBlur, onChange, onKeyDown, onCompositionStart, onCompositionEnd,
			$box,
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
		let onTextareaFocus: FocusEventHandler<HTMLTextAreaElement> | undefined = (void 0);
		if (selectAll || onFocus != null) {
			onTextareaFocus = (ev) => {
				if (selectAll) {
					ev.target.select();
				}
				onFocus?.(ev, $model, context);
			};
		}

		// noinspection DuplicatedCode
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
			// noinspection DuplicatedCode
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
		/**
		 * IME composition start handler
		 * Triggered when user starts typing a multi-bytes character (e.g. Chinese pinyin input)
		 * @param ev - Composition start event object
		 */
		const onInputCompositionStart: CompositionEventHandler<HTMLTextAreaElement> = (ev) => {
			compositionRef.current.enabled = true;
			onCompositionStart?.(ev, $model, context);
		};

		/**
		 * IME composition end handler
		 * Triggered when user finishes typing a multi-bytes character, commits the final value
		 * @param ev - Composition end event object
		 */
		const onInputCompositionEnd: CompositionEventHandler<HTMLTextAreaElement> = (ev) => {
			compositionRef.current.enabled = false;
			onTextValueChange((ev.target as HTMLInputElement).value);
			onCompositionEnd?.(ev, $model, context);
		};
		/**
		 * Handle keyboard input events.
		 * Only active when emitChangeOnBlur is true:
		 * - Pressing Enter key commits the current value immediately (same behavior as blur event)
		 * - Supports form submission workflows without requiring users to tab away from the textarea
		 *
		 * @param ev - Keyboard event object
		 */
		const onTextareaKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (ev) => {
			if (emitChangeOnBlur && ev.key === 'Enter') {
				commitCurrentValue(ev.currentTarget.value);
			}
			// Propagate key event to custom handler with standard component event parameters
			onKeyDown?.(ev, $model, context);
		};

		/**
		 * Handle textarea blur event
		 * - Clears pending debounced updates only when in debounce mode
		 * - Updates model immediately if emitChangeOnBlur is true
		 */
		const onTextareaBlur: FocusEventHandler<HTMLTextAreaElement> = (ev) => {
			if (emitChangeOnBlur) {
				commitCurrentValue(ev.target.value);
			}
			// Propagate blur event to user-provided handler
			onBlur?.(ev, $model, context);
		};

		const boxProps = $box != null ? exposePropsToDOM($box, $model, context) : (void 0);
		// eslint-disable-next-line react-hooks/refs
		const value = (compositionRef.current.enabled ? compositionRef.current.text : ERO.getValue($model, $field)) ?? '';
		/** Processed props with reactive values exposed as DOM data attributes */
		const {style, ...restProps} = exposePropsToDOM(rest, $model, context);
		const textStyle = {
			...style,
			'--rows': rows,
			'--max-rows': typeof autoRows === 'number' ? autoRows : (void 0)
		};
		const showPlaceholder = !disabled && !readonly
			&& placeholder != null && (typeof placeholder !== 'string' || placeholder.trim().length !== 0);
		const showCharLimit = !disabled && !readonly && charLimit != null && charLimit > 0;
		// eslint-disable-next-line react-hooks/refs
		const currentCharCount = value == null ? 0 : `${value}`.length;

		return <div {...boxProps}
		            data-hx-textarea-box=""
		            data-hx-textarea-char-limit={showCharLimit ? '' : (void 0)}
		            data-hx-visible={(visible ?? true) ? '' : (void 0)}
		            data-hx-disabled={(disabled ?? false) ? '' : (void 0)}
		            data-hx-readonly={(readonly ?? false) ? '' : (void 0)}>
			<textarea {...restProps}
			          name={name ?? ERO.pathOf($model, $field)}
				// eslint-disable-next-line react-hooks/refs
				      value={value}
				      onChange={onTextareaChange}
				      onFocus={onTextareaFocus} onBlur={onTextareaBlur} onKeyDown={onTextareaKeyDown}
				      onCompositionStart={onInputCompositionStart} onCompositionEnd={onInputCompositionEnd}
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
				? <HxLabel text={placeholder} data-hx-textarea-placeholder=""/>
				: (void 0)}
			{showCharLimit
				? <HxLabel text={`${currentCharCount} / ${charLimit}`} role="textarea-char-limit"/>
				: (void 0)}
		</div>;
	}) as unknown as HxTextareaType;
// @ts-expect-error assign component name
HxTextarea.displayName = 'HxTextarea';

/**
 * Configuration options for HxWithCheck wrapper
 * Defines how validation context is supplied to the textarea component
 */
const HxWithCheckTextareaOptions: HxWithCheckCreateOptions<object, HxTextareaProps<object>> = {
	$supplyOn: (props: HxTextareaProps<object>): CheckPropSuppliedOn => {
		// Validation is tied to the $field prop of the textarea
		return props.$field;
	}
};
/**
 * Textarea component with built-in validation support.
 * Combines HxTextarea functionality with HxWithCheck validation capabilities.
 *
 * @example
 * ```tsx
 * <HxWithCheckTextarea
 *   $model={formModel}
 *   $field="email"
 *   $check={...}
 * />
 * ```
 */
export type HxWithCheckTextareaType = <T extends object>(
	props: HxWithCheckProps<T, HxTextareaProps<T>> & RefAttributes<HTMLTextAreaElement>
) => ReactElement | null;
/**
 * Textarea component with built-in form validation features.
 * Supports all HxTextarea props plus additional validation rules from HxWithCheck.
 */
export const HxWithCheckTextarea = HxWithCheck(HxTextarea, HxWithCheckTextareaOptions) as unknown as HxWithCheckTextareaType;
// @ts-expect-error assign component name
HxWithCheckTextarea.displayName = 'HxWithCheckTextarea';
