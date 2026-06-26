import {ERO} from '@hx/data';
// @ts-expect-error import React
import React, {
	type ChangeEventHandler,
	type ClipboardEventHandler,
	type ForwardedRef,
	forwardRef,
	type InputEventHandler,
	type ReactElement,
	type RefAttributes,
	useEffect,
	useRef
} from 'react';
import {useHxContext} from '../../contexts';
import {useDataMonitor, useDualRef} from '../../hooks';
import {DeviceCheck, DOMUtils, HxConsole} from '../../utils';
import {
	createHxInputBlurHandler,
	createHxInputFocusHandler,
	createHxInputKeyDownHandler,
	type HxInputCompositionState,
	useHxInputCompositionHandlers,
	useHxInputValueChangeAndCommit
} from '../input';
import {HxInputDefaults} from '../input/defaults';
import type {HxFormatInputChange, HxFormatInputInnerProps} from './types';

export type HxFormatInputInnerType = <T extends object>(
	props: HxFormatInputInnerProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

/**
 * Format-aware input that intercepts user edits, classifies the change,
 * and delegates correction to a {@link HxFormatInputPatternKit}.
 *
 * ## Caret tracking
 *
 * Pre-change cursor/selection position is captured via two complementary
 * listeners so every edit scenario is covered:
 *
 * - **`beforeinput` event** — fires before the DOM mutation on character
 *   insertion / paste / cut.  Guarantees pre-change selection for normal
 *   typing.  Not dispatched for Backspace/Delete in some browsers.
 * - **`document.selectionchange` event** — fires on any selection change
 *   (click, keyboard navigation, drag-select).  Covers Backspace/Delete
 *   and focus placement where `beforeinput` may not fire.  Because
 *   `selectionchange` is dispatched *after* `input` in the keyboard
 *   sequence, it never overwrites the pre-change position captured by
 *   `beforeinput` during the same edit round.
 *
 * Both are stored in `userCaretPositionRef` which `onTextValueChange`
 * reads to determine what the user intended.
 *
 * ## Change classification
 *
 * Rather than relying on a generic text-diff algorithm (which cannot
 * distinguish replace-part from delete when replaced characters match
 * surrounding text), every edit is explicitly classified into one of:
 *
 * - `none`         — `oldValue === newValue`
 * - `insert`       — cursor placed, text grew
 * - `delete`       — selection or cursor-based removal
 * - `replace-part` — partial selection replaced
 * - `replace-all`  — entire value replaced
 *
 * Prefix / suffix / deleted / inserted are computed per branch from
 * the known old value, new value, and pre-change caret position,
 * producing an accurate {@link HxFormatInputChange} for the kit.
 */
export const HxFormatInputInner =
	forwardRef(<T extends object>(props: HxFormatInputInnerProps<T>, ref: ForwardedRef<HTMLInputElement>) => {
		const {
			$model,
			$field, kit,
			selectAll = HxInputDefaults.selectAll,
			emitChangeOnBlur = HxInputDefaults.emitChangeOnBlur,
			emitChangeDelay: ecd = HxInputDefaults.emitChangeDelay,
			name,
			onFocus, onBlur,
			onChange, onBeforeInput, onKeyDown,
			onCompositionStart, onCompositionEnd,
			onCopy,
			...rest
		} = props;

		const context = useHxContext();
		const {visible, disabled, readonly} = useDataMonitor(props);

		const inputRef = useDualRef(ref);
		const valueBeforeChangeRef = useRef<string>(kit.fromModel(ERO.revoke(ERO.getValue($model, $field)), context) ?? '');
		const userCaretPositionRef = useRef<{
			start: number, end: number,
			direction: Exclude<HTMLInputElement['selectionDirection'], null>
		} | undefined>();
		const caretPositionRef = useRef({set: false, pos: -1});
		// Local state storage for input value when emitChangeOnBlur is false and emitChangeDelay is not zero
		// Allows input to display typed value immediately without updating the model
		const valueBeforeEmitRef = useRef<string | null | undefined>(kit.fromModel(ERO.revoke(ERO.getValue($model, $field)), context));
		const backspaceRef = useRef(false);
		const compositionRef = useRef<HxInputCompositionState>({enabled: false, text: ''});
		useEffect(() => {
			const {set, pos} = caretPositionRef.current;
			if (set) {
				let start = 0, end = 0, direction: HTMLInputElement['selectionDirection'] = 'none';
				if (pos === -1 && userCaretPositionRef.current != null) {
					start = userCaretPositionRef.current.start;
					end = userCaretPositionRef.current.end;
					direction = userCaretPositionRef.current.direction;
				} else {
					start = end = pos;
					userCaretPositionRef.current = {start, end, direction: 'none'};
				}
				if (DeviceCheck.checkAndroid()) {
					setTimeout(() => {
						inputRef.current?.setSelectionRange(start, end, direction);
					}, 0);
				} else {
					inputRef.current?.setSelectionRange(start, end, direction);
				}
				caretPositionRef.current = {set: false, pos: -1};
			}
			// no dependency array: reads ref values (caretPositionRef, inputRef)
			// that never trigger re-renders, so this must run after every render
			// to check whether caret repositioning is needed
		});
		useEffect(() => {
			const onSelectionChange = () => {
				const el = document.activeElement;
				if (el !== inputRef.current) {
					return;
				}
				if (compositionRef.current.enabled) {
					// ignore the selection change leading by composition mode
					return;
				}

				const input = el as HTMLInputElement;
				userCaretPositionRef.current = {
					start: input.selectionStart!, end: input.selectionEnd!,
					direction: input.selectionDirection!
				};
				// HxConsole.log('On selection change: ', JSON.stringify(userCaretPositionRef.current));
			};
			document.addEventListener('selectionchange', onSelectionChange);
			return () => {
				document.removeEventListener('selectionchange', onSelectionChange);
			};
		}, [inputRef]);

		const {commitCurrentValue, onTextValueChange: baseOnTextValueChange} = useHxInputValueChangeAndCommit({
			$model, $field, toModelValue: kit.lambdaOfToModel(),
			emitChangeOnBlur, emitChangeDelay: ecd < 0 ? 0 : ecd,
			context, valueBeforeEmitRef, compositionRef
		});
		const onTextValueChange = (text: string) => {
			// HxConsole.log('On text value change: ', JSON.stringify({
			// 	start: inputRef.current!.selectionStart, end: inputRef.current!.selectionEnd,
			// 	direction: inputRef.current!.selectionDirection
			// }));

			// HxConsole.log('On text value change: ', JSON.stringify(userCaretPositionRef.current));
			const isBackspace = backspaceRef.current;
			backspaceRef.current = false;

			if (compositionRef.current.enabled) {
				// composition mode, apply change directly
				baseOnTextValueChange(text);
				return;
			}

			if (userCaretPositionRef.current == null) {
				// fallback, never happen
				HxConsole.warn(`Fallback to accept input change directly because of input selection not captured, old is [${valueBeforeChangeRef.current}] and new is [${text}].`);
				baseOnTextValueChange(text);
				return;
			}

			let change: HxFormatInputChange;

			const oldValue = valueBeforeChangeRef.current;
			const newValue = text;
			const startOfOld = userCaretPositionRef.current.start;
			const endOfOld = userCaretPositionRef.current.end;

			// nothing changed
			if (oldValue === newValue) {
				change = {
					oldValue, newValue, isBackspace,
					prefix: oldValue.substring(0, startOfOld), suffix: oldValue.substring(endOfOld),
					deleted: oldValue.substring(startOfOld, endOfOld),
					inserted: newValue.substring(startOfOld, endOfOld),
					type: 'none'
				};
			}
			// delete all
			else if (newValue === '') {
				change = {
					oldValue, newValue, isBackspace,
					prefix: '', suffix: '', deleted: oldValue, inserted: '',
					type: 'delete'
				};
			}
			// nothing selected, possible action is insert, or delete by delete key or backspace key
			else if (startOfOld === endOfOld) {
				// caret before first char, possible action is insert or delete by delete key
				if (startOfOld === 0) {
					// insert
					if (newValue.length > oldValue.length) {
						change = {
							oldValue, newValue, isBackspace,
							prefix: '', suffix: oldValue,
							deleted: '', inserted: newValue.substring(0, newValue.length - oldValue.length),
							type: 'insert'
						};
					}
					// delete
					else {
						change = {
							oldValue, newValue,
							isBackspace,
							prefix: '', suffix: newValue,
							deleted: oldValue.substring(0, oldValue.length - newValue.length), inserted: '',
							type: 'delete'
						};
					}
				}
				// caret after last char, possible action is insert or delete by backspace key
				else if (startOfOld === oldValue.length) {
					// insert
					if (newValue.length > oldValue.length) {
						change = {
							oldValue, newValue,
							isBackspace,
							prefix: oldValue, suffix: '',
							deleted: '', inserted: newValue.substring(oldValue.length),
							type: 'insert'
						};
					}
					// delete
					else {
						change = {
							oldValue, newValue,
							isBackspace,
							prefix: newValue, suffix: '',
							deleted: oldValue.substring(newValue.length), inserted: '',
							type: 'delete'
						};
					}
				}
				// caret after first char and before last char, possible action is insert or delete
				else {
					const prefix = oldValue.substring(0, startOfOld);
					const suffix = oldValue.substring(endOfOld);
					// insert
					if (newValue.length > oldValue.length) {
						change = {
							oldValue, newValue, isBackspace,
							prefix, suffix,
							deleted: '', inserted: newValue.substring(prefix.length, newValue.length - suffix.length),
							type: 'insert'
						};
					}
					// delete by backspace key
					else if (isBackspace) {
						// Backspace, CTRL + Backspace (Not Mac), Options + Backspace (Mac)
						const deletedCharCount = oldValue.length - newValue.length;
						change = {
							oldValue, newValue, isBackspace,
							prefix: prefix.substring(0, prefix.length - deletedCharCount), suffix,
							deleted: prefix.substring(prefix.length - deletedCharCount), inserted: '',
							type: 'delete'
						};
					}
					// delete by delete key
					else {
						// Delete, CTRL + Delete (Not Mac), Options + Delete (Mac)
						const deletedCharCount = oldValue.length - newValue.length;
						change = {
							oldValue, newValue, isBackspace,
							prefix, suffix: suffix.substring(deletedCharCount),
							deleted: suffix.substring(0, deletedCharCount), inserted: '',
							type: 'delete'
						};
					}
				}
			}
			// replaced all
			else if ((startOfOld === 0 && endOfOld === oldValue.length)
				// never happen, start always less than or equals end, leave it as guard logic anyway
				|| (startOfOld === oldValue.length && endOfOld === 0)) {
				// new value is not empty, and startOfOld not equals endOfOld
				// which means replace-all
				change = {
					oldValue, newValue, isBackspace,
					prefix: '', suffix: '', deleted: oldValue, inserted: newValue,
					type: 'replace-all'
				};
			}
			// something selected, possible action is replace partial, or delete by delete key or backspace key
			else {
				const prefix = oldValue.substring(0, startOfOld);
				const suffix = oldValue.substring(endOfOld);
				// selection deleted
				if (newValue === (prefix + suffix)) {
					change = {
						oldValue, newValue, isBackspace,
						prefix, suffix,
						deleted: oldValue.substring(startOfOld, endOfOld), inserted: '',
						type: 'delete'
					};
				}
				// replace-part
				else {
					change = {
						oldValue, newValue, isBackspace,
						prefix, suffix,
						deleted: oldValue.substring(startOfOld, endOfOld),
						inserted: newValue.substring(startOfOld, newValue.length - suffix.length),
						type: 'replace-part'
					};
				}
			}
			const [corrected, caretPos] = kit.correct(change, context);
			valueBeforeChangeRef.current = corrected;
			caretPositionRef.current = {set: true, pos: caretPos};
			baseOnTextValueChange(corrected);
		};

		// noinspection DuplicatedCode
		const onInputFocus = createHxInputFocusHandler({
			$model, selectAll, onFocus, context
		});
		const onInputChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
			onTextValueChange(ev.target.value);
			onChange?.(ev, $model, context);
		};
		const onInputBeforeInput: InputEventHandler<HTMLInputElement> = (ev) => {
			if (!compositionRef.current.enabled) {
				const input = ev.target as HTMLInputElement;
				userCaretPositionRef.current = {
					start: input.selectionStart!, end: input.selectionEnd!,
					direction: input.selectionDirection!
				};
				// HxConsole.log('On before input: ', JSON.stringify(userCaretPositionRef.current));
			}
			onBeforeInput?.(ev, $model, context);
		};
		// eslint-disable-next-line react-hooks/refs
		const onInputKeyDown = createHxInputKeyDownHandler<T, HTMLInputElement>({
			$model, context, onKeyDown: (ev, $model, context) => {
				if (ev.key === 'Backspace') {
					backspaceRef.current = true;
				}
				onKeyDown?.(ev, $model, context);
			}, emitChangeOnBlur, commitCurrentValue
		});
		const {
			onCompositionStart: onInputCompositionStart, onCompositionEnd: onInputCompositionEnd
		} = useHxInputCompositionHandlers({
			$model, context, onCompositionStart, onCompositionEnd, compositionRef, onTextValueChange
		});
		// eslint-disable-next-line react-hooks/refs
		const onInputBlur = createHxInputBlurHandler<T, HTMLInputElement>({
			$model, context, onBlur: (ev, model, context) => {
				// value already committed to model
				// now format it and fix the display if needed
				valueBeforeChangeRef.current = kit.fromModel(ERO.revoke(ERO.getValue($model, $field)), context) ?? '';
				if (valueBeforeChangeRef.current !== inputRef.current?.value) {
					inputRef.current!.value = valueBeforeChangeRef.current;
				}
				onBlur?.(ev, model, context);
			}, emitChangeOnBlur, commitCurrentValue
		});
		const onInputCopy: ClipboardEventHandler<HTMLInputElement> = (ev) => {
			const target = ev.target as HTMLInputElement;
			// commit to model first
			if (emitChangeOnBlur) {
				commitCurrentValue(target.value);
			}
			// get model value and copy to clipboard
			const modelValue = ERO.getValue($model, $field);
			if (modelValue != null && modelValue !== '') {
				ev.clipboardData.setData('text/plain', modelValue);
			}
			onCopy?.(ev, $model, context);
			ev.preventDefault();
		};

		// eslint-disable-next-line react-hooks/refs
		const value = (compositionRef.current.enabled ? compositionRef.current.text : valueBeforeChangeRef.current) ?? '';
		/** Processed props with reactive values exposed as DOM data attributes */
		const restProps = DOMUtils.exposePropsToDOM(rest, $model, context);

		return <input {...restProps}
		              // TODO prevent drag-and-drop in formatted input — DnD bypasses beforeinput/input
		              // events and the resulting value cannot be corrected by the format kit.
		              // Add onDragStart={e => e.preventDefault()} onDrop={e => e.preventDefault()}
		              name={name ?? ERO.pathOf($model, $field)} type="text"
			// eslint-disable-next-line react-hooks/refs
			          value={value}
			          onChange={onInputChange} onBeforeInput={onInputBeforeInput}
			          onFocus={onInputFocus} onBlur={onInputBlur} onKeyDown={onInputKeyDown}
			          onCompositionStart={onInputCompositionStart} onCompositionEnd={onInputCompositionEnd}
			          onCopy={onInputCopy}
			          data-hx-input="" data-hx-format-input=""
			          data-hx-model-path={ERO.pathOf($model, $field)}
			          data-hx-visible={(visible ?? true) ? '' : 'no'}
			          data-hx-disabled={(disabled ?? false) ? '' : (void 0)} disabled={disabled ?? false}
			          data-hx-readonly={(readonly ?? false) ? '' : (void 0)} readOnly={readonly ?? false}
			          ref={inputRef}/>;
	}) as unknown as HxFormatInputInnerType;
// @ts-expect-error assign component name
HxFormatInputInner.displayName = 'HxFormatInputInner';
