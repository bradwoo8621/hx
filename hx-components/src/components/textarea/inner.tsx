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
import {useDataMonitor, useDualRef} from '../../hooks';
import {asStr, exposePropsToDOM, pickCommonProps} from '../../utils';
import {
	createHxInputBlurHandler,
	createHxInputFocusHandler,
	createHxInputKeyDownHandler,
	useHxInputCompositionHandlers,
	useHxInputValueChangeAndCommit
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

		const context = useHxContext();
		const {visible, disabled, readonly} = useDataMonitor(props);
		const valueBeforeEmitRef = useRef<string | null | undefined>(asStr(ERO.revoke(ERO.getValue($model, $field))));
		const compositionRef = useRef({enabled: false, text: ''});
		const textareaRef = useDualRef(ref);
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

		const {commitCurrentValue, onTextValueChange} = useHxInputValueChangeAndCommit({
			$model, $field, emitChangeOnBlur, emitChangeDelay: ecd < 0 ? 0 : ecd,
			context, valueBeforeEmitRef, compositionRef
		});

		const onTextareaFocus = createHxInputFocusHandler({$model, selectAll, onFocus, context});
		const onTextareaChange: ChangeEventHandler<HTMLTextAreaElement> = (ev) => {
			onTextValueChange(ev.target.value);
			onChange?.(ev, $model, context);
		};
		const onTextareaKeyDown = createHxInputKeyDownHandler({
			$model, context, onKeyDown, emitChangeOnBlur, commitCurrentValue
		});
		const {
			onCompositionStart: onTextareaCompositionStart, onCompositionEnd: onTextareaCompositionEnd
		} = useHxInputCompositionHandlers({
			$model, context, onCompositionStart, onCompositionEnd, compositionRef, onTextValueChange
		});
		const onTextareaBlur = createHxInputBlurHandler({
			$model, context, onBlur, emitChangeOnBlur, commitCurrentValue
		});

		const $wrapper = {...($domBox ?? $domCheckBox), ...pickCommonProps(rest)};
		const wrapperProps = exposePropsToDOM($wrapper, $model, context);
		// eslint-disable-next-line react-hooks/refs
		const value = (compositionRef.current.enabled
				? compositionRef.current.text
				: asStr(ERO.getValue($model, $field)))
			?? '';
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
