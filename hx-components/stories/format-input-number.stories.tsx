import {ERO} from '@hx/data';
import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React, {useRef, useState} from 'react';
import {HxButton, HxFormatInput, type HxFormatInputNumberPattern, HxLabel} from '../src';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - Number',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asDisplayValue = (value: any) => {
	if (value === (void 0)) {
		return '[undefined]';
	} else if (value == null) {
		return '[null]';
	} else if (value === '') {
		return '[empty string]';
	} else {
		return (typeof value) + ' [' + value + ']';
	}
};

/**
 * Helper that creates a simple labeled format input for visual testing.
 */
const Fixture = ({pattern, label, initialValue, test}: {
	pattern: HxFormatInputNumberPattern;
	label: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	initialValue: any;
	test?: (input: HTMLInputElement) => void;
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [model] = useState(() => ERO.reactive(new Proxy({
		value: initialValue,
		displayValue: asDisplayValue(initialValue)
	}, {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		set(target: any, p: string | symbol, newValue: any, receiver: any): boolean {
			if (p === 'value') {
				target.displayValue = asDisplayValue(newValue);
			}
			return Reflect.set(target, p, newValue, receiver);
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		deleteProperty(target: any, p: string | symbol): boolean {
			if (p === 'value') {
				target.displayValue = asDisplayValue(void 0);
			}
			return Reflect.deleteProperty(target, p);
		}
	})));

	const onTestClick = () => {
		if (inputRef.current == null) {
			return;
		}

		test?.(inputRef.current);
	};

	return <div style={{display: 'flex', flexDirection: 'column', gap: '4px', width: '600px'}}>
		<HxLabel text="Pattern:" style={{marginBottom: '-12px'}}/>
		<HxLabel text={`[${pattern}]`} color="primary"/>
		<HxLabel text="Behaviour:" style={{marginBottom: '-12px'}}/>
		<HxLabel text={`[${label}]`} color="primary"/>
		<HxLabel text="Test Input:" style={{marginBottom: '-8px'}}/>
		<HxFormatInput $model={model} $field="value" pattern={pattern}
		               autoComplete="off"
		               ref={inputRef}/>
		<HxLabel text="Model Value:" style={{marginBottom: '-12px'}}/>
		<HxLabel $model={model} $field="displayValue" color="primary" $change={{
			on: 'value',
			handle: () => 'repaint'
		}}/>
		{test != null
			? <HxButton text="Start Test, Watch input value, caret, and model value."
			            uppercase={false} color="info" onClick={onTestClick}/>
			: (void 0)
		}
	</div>;
};

const caretAt = (input: HTMLInputElement, caret: number | [number, number]) => {
	input.focus();
	input.selectionStart = typeof caret === 'number' ? caret : caret[0];
	input.selectionEnd = typeof caret === 'number' ? caret : caret[1];
};
const fireDelete = (input: HTMLInputElement, caret: number | [number, number]) => {
	caretAt(input, caret);
	// noinspection JSDeprecatedSymbols
	console.log(`Command[forwardDelete] executed, return ${document.execCommand('forwardDelete')}.`);
};
const fireBackspace = (input: HTMLInputElement, caret: number | [number, number]) => {
	caretAt(input, caret);
	// noinspection JSDeprecatedSymbols
	console.log(`Command[delete] executed, return ${document.execCommand('delete')}.`);
};

// ── Deletion ──────────────────────────────────────────────────────────

/** Delete a digit from a grouped integer — value reformats automatically */
export const DeleteDigitFromGroupedByDelete: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → delete 4 → 123 (caret after 3)"
		initialValue={1234}
		test={input => fireDelete(input, 4)}/>
};

/** Backspace a digit from a grouped integer — value reformats automatically */
export const DeleteDigitFromGroupedByBackspace: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → backspace 4 → 123 (caret after 3)"
		initialValue={1234}
		test={input => fireBackspace(input, 5)}/>
};

/** Delete the digit before a grouping separator, caret lands before the separator */
export const DeleteBeforeGroupingSeparator: Story = {
	render: () => <Fixture
		pattern="@nug" label="12,345 → delete 2 (before comma) → 1,345"
		initialValue={12345}/>
};

/** Backspace to delete the digit right after a grouping separator */
export const BackspaceDeleteDigitAfterGrouping: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → backspace delete 2 → 134"
		initialValue={1234}/>
};

/** Backspace the grouping separator itself — value stays, caret moves */
export const BackspaceGroupingSeparator: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → backspace comma → 1,234 (caret before comma)"
		initialValue={1234}/>
};

/** Delete key on grouping separator — value stays, caret after comma */
export const DeleteGroupingSeparator: Story = {
	render: () => <Fixture
		pattern="@nug" label="1,234 → delete comma → 1,234 (caret after comma)"
		initialValue={1234}/>
};

/** Delete from unsigned input (no minus sign) */
export const DeleteDigitUnsigned: Story = {
	render: () => <Fixture
		pattern="@nud3" label="123 → delete 3 → 12"
		initialValue={123}/>
};

// ── Insert — maxIntegerDigits === 0 ────────────────────────────────────

/** Only zero is allowed; type non-zero → rejected */
export const MaxIntegerZeroRejectsNonZero: Story = {
	render: () => <Fixture
		pattern="@nd0" label="maxIntegerDigits=0: type 5 → rejected"
		initialValue={(void 0)}/>
};

/** Zero is the only allowed integer digit */
export const MaxIntegerZeroAcceptsZero: Story = {
	render: () => <Fixture
		pattern="@nd0" label="maxIntegerDigits=0: type 0 → 0"
		initialValue={(void 0)}/>
};

/** Type -0 when maxIntegerDigits=0 */
export const MaxIntegerZeroAcceptsMinusZero: Story = {
	render: () => <Fixture
		pattern="@nd0" label="maxIntegerDigits=0: type -0 → -0"
		initialValue={(void 0)}/>
};

/** Type -5 when maxIntegerDigits=0 → minus accepted, digit rejected */
export const MaxIntegerZeroRejectsNonZeroWithMinus: Story = {
	render: () => <Fixture
		pattern="@nd0" label="maxIntegerDigits=0: type -5 → -"
		initialValue={(void 0)}/>
};

/** Type 05 when maxIntegerDigits=0 → truncated to 0 */
export const MaxIntegerZeroTruncatesExtraDigits: Story = {
	render: () => <Fixture
		pattern="@nd0" label="maxIntegerDigits=0: type 05 → 0"
		initialValue={(void 0)}/>
};

// ── Insert — maxIntegerDigits finite ───────────────────────────────────

/** Type digits within limit */
export const MaxIntegerWithinLimit: Story = {
	render: () => <Fixture
		pattern="@nd3" label="maxIntegerDigits=3: type 123 → 123"
		initialValue={(void 0)}/>
};

/** Type digits exceeding limit → truncated */
export const MaxIntegerExceedLimit: Story = {
	render: () => <Fixture
		pattern="@nd3" label="maxIntegerDigits=3: type 12345 → 123"
		initialValue={(void 0)}/>
};

/** Leading zeros stripped when maxIntegerDigits > 0 */
export const LeadingZerosStripped: Story = {
	render: () => <Fixture
		pattern="@nd5" label="maxIntegerDigits=5: type 00123 → 123"
		initialValue={(void 0)}/>
};

/** Leading zeros stripped, truncation also applies */
export const LeadingZerosWithTruncation: Story = {
	render: () => <Fixture
		pattern="@nd3" label="maxIntegerDigits=3: type 0012345 → 123"
		initialValue={(void 0)}/>
};

/** Insert digits in the middle (prefix has existing digits) */
export const InsertInMiddle: Story = {
	render: () => <Fixture
		pattern="@nd5" label="maxIntegerDigits=5: 12|45 → insert 3 → 1,2345"
		initialValue={1245}/>
};

/** Insert digits in the middle exceeding limit */
export const InsertInMiddleExceedLimit: Story = {
	render: () => <Fixture
		pattern="@nd3" label="maxIntegerDigits=3: 12|3 → insert 45 → 123"
		initialValue={123}/>
};

// ── Insert — unsigned ──────────────────────────────────────────────────

/** Minus rejected when unsigned */
export const UnsignedRejectsMinus: Story = {
	render: () => <Fixture
		pattern="@nu" label="unsigned: type -5 → minus rejected, get 5"
		initialValue={(void 0)}/>
};

/** Unsigned with maxIntegerDigits */
export const UnsignedWithMaxIntegerDigits: Story = {
	render: () => <Fixture
		pattern="@nud3" label="unsigned maxIntegerDigits=3: type 12345 → 123"
		initialValue={(void 0)}/>
};

// ── Insert — maxFractionDigits ─────────────────────────────────────────

/** Type decimal point and fraction within limit */
export const FractionWithinLimit: Story = {
	render: () => <Fixture
		pattern="@nf2" label="maxFractionDigits=2: type 1.23 → 1.23"
		initialValue={(void 0)}/>
};

/** Fraction exceeds limit */
export const FractionExceedLimit: Story = {
	render: () => <Fixture
		pattern="@nf2" label="maxFractionDigits=2: type 1.2345 → 1.23"
		initialValue={(void 0)}/>
};

/** Fraction part with maxFractionDigits=0 */
export const MaxFractionZero: Story = {
	render: () => <Fixture
		pattern="@nf0" label="maxFractionDigits=0: type 1.5 → 1"
		initialValue={(void 0)}/>
};

/** Fixed fraction (x flag) — trailing zeros preserved */
export const FixedFraction: Story = {
	render: () => <Fixture
		pattern="@nf2x" label="fixed fraction 2: initial 1 → 1.00"
		initialValue={1}/>
};

/** Insert fraction digits when prefix already has decimal point (Branch B) */
export const InsertFractionAfterDecimalInPrefix: Story = {
	render: () => <Fixture
		pattern="@nf3" label="1.|2 → insert 5 → 1.52"
		initialValue={1.2}/>
};

// ── Insert — minus sign handling ───────────────────────────────────────

/** Type minus at the beginning */
export const MinusAtBeginning: Story = {
	render: () => <Fixture
		pattern="@nd5" label="type -123 → -123"
		initialValue={(void 0)}/>
};

/** Type minus after digits (minus in middle → truncated) */
export const MinusInMiddle: Story = {
	render: () => <Fixture
		pattern="@nd5" label="12|-45 → insert - → rejected or trunc"
		initialValue={1245}/>
};

/** Negative number with maxIntegerDigits */
export const NegativeWithMaxIntegerDigits: Story = {
	render: () => <Fixture
		pattern="@nd4" label="maxIntegerDigits=4: type -12345 → -1234"
		initialValue={(void 0)}/>
};

// ── Replace-all (paste) ────────────────────────────────────────────────

/** Paste valid number */
export const PasteValidNumber: Story = {
	render: () => <Fixture
		pattern="@nug" label="select all → paste 5678 → 5,678"
		initialValue={1234}/>
};

/** Paste intermediate state (bare minus) */
export const PasteBareMinus: Story = {
	render: () => <Fixture
		pattern="@nd5" label="select all → paste '-' → -"
		initialValue={123}/>
};

/** Paste intermediate state (bare decimal point) */
export const PasteBareDecimal: Story = {
	render: () => <Fixture
		pattern="@nf2" label="select all → paste '.' → ."
		initialValue={123}/>
};

/** Paste minus + decimal (intermediate state) */
export const PasteMinusDecimal: Story = {
	render: () => <Fixture
		pattern="@nf2" label="select all → paste '-.' → -."
		initialValue={123}/>
};

/** Paste empty/whitespace → ignored, old value kept */
export const PasteWhitespace: Story = {
	render: () => <Fixture
		pattern="@nug" label="select all → paste spaces → unchanged"
		initialValue={1234}/>
};

/** Paste value exceeding maxIntegerDigits */
export const PasteExceedMaxInteger: Story = {
	render: () => <Fixture
		pattern="@nd3" label="select all → paste 12345 → 123"
		initialValue={1}/>
};

/** Paste value with leading zeros */
export const PasteLeadingZeros: Story = {
	render: () => <Fixture
		pattern="@nd5" label="select all → paste 00123 → 123"
		initialValue={1}/>
};

/** Paste with decimal point, truncate fraction */
export const PasteTruncateFraction: Story = {
	render: () => <Fixture
		pattern="@nf2" label="select all → paste 1.2345 → 1.23"
		initialValue={(void 0)}/>
};

// ── Decimal point edge cases ───────────────────────────────────────────

/** Insert decimal point in the middle (suffix has integer digits → become fraction) */
export const InsertDecimalInMiddle: Story = {
	render: () => <Fixture
		pattern="@nf3" label="12|34 → insert '.' → 12.34"
		initialValue={1234}/>
};

/** Insert decimal point after grouping */
export const InsertDecimalInGrouped: Story = {
	render: () => <Fixture
		pattern="@nugf2" label="1,234| → insert '.' → 1,234."
		initialValue={1234}/>
};

/** Integer truncation clears fraction too */
export const IntegerTruncationClearsFraction: Story = {
	render: () => <Fixture
		pattern="@nd3f2" label="12|.34 → insert 345 → 123 (fraction dropped)"
		initialValue={12.34}/>
};

// ── Grouping ───────────────────────────────────────────────────────────

/** Typing in a grouped field creates separators automatically */
export const GroupingAutoFormat: Story = {
	render: () => <Fixture
		pattern="@nug" label="grouping: type 1234567 → 1,234,567"
		initialValue={(void 0)}/>
};

/** Typing in an ungrouped field does not add separators */
export const UngroupedNoSeparators: Story = {
	render: () => <Fixture
		pattern="@n" label="no grouping: type 1234567 → 1234567"
		initialValue={(void 0)}/>
};
