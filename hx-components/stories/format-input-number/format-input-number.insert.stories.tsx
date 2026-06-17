import type {Meta, StoryObj} from '@storybook/react-vite';
// @ts-expect-error import React
import React from 'react';
import {HxFormatInput} from '../../src';
import {Fixture} from './format-input-number.shared';

const meta: Meta<typeof HxFormatInput> = {
	title: 'Components/Basic/Format Input - Number/Insert',
	component: HxFormatInput,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered'
	}
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// ── maxIntegerDigits === 0 ─────────────────────────────────────────────

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

/** Type bare minus when maxIntegerDigits=0 → intermediate state */
export const MaxIntegerZeroAcceptsBareMinus: Story = {
	render: () => <Fixture
		pattern="@nd0" label="maxIntegerDigits=0: type - → -"
		initialValue={(void 0)}/>
};

// ── maxIntegerDigits finite ────────────────────────────────────────────

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
		pattern="@ngd5" label="maxIntegerDigits=5: 1,2|45 → insert 3 → 12,345"
		initialValue={1245}/>
};

/** Insert digits in the middle exceeding limit */
export const InsertInMiddleExceedLimit: Story = {
	render: () => <Fixture
		pattern="@nd3" label="maxIntegerDigits=3: 12|3 → insert 45 → 123"
		initialValue={123}/>
};

// ── unsigned ───────────────────────────────────────────────────────────

/** Minus rejected when unsigned */
export const UnsignedRejectsMinus: Story = {
	render: () => <Fixture
		pattern="@nu" label="unsigned: type -5 → rejected"
		initialValue={(void 0)}/>
};

/** Unsigned with maxIntegerDigits */
export const UnsignedWithMaxIntegerDigits: Story = {
	render: () => <Fixture
		pattern="@nud3" label="unsigned maxIntegerDigits=3: type 12345 → 123"
		initialValue={(void 0)}/>
};

// ── maxFractionDigits ──────────────────────────────────────────────────

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

// ── minus sign handling ────────────────────────────────────────────────

/** Type minus at the beginning */
export const MinusAtBeginning: Story = {
	render: () => <Fixture
		pattern="@nd5" label="type -123 → -123"
		initialValue={(void 0)}/>
};

/** Type minus after digits (minus in middle → rejected) */
export const MinusInMiddle: Story = {
	render: () => <Fixture
		pattern="@nd5" label="12|45 → insert - → rejected"
		initialValue={1245}/>
};

/** Negative number with maxIntegerDigits */
export const NegativeWithMaxIntegerDigits: Story = {
	render: () => <Fixture
		pattern="@nd4" label="maxIntegerDigits=4: type -12345 → -1234"
		initialValue={(void 0)}/>
};

// ── decimal point edge cases ───────────────────────────────────────────

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
		pattern="@nd3f2" label="12|.34 → insert 345 → 123.34"
		initialValue={12.34}/>
};

// ── grouping ───────────────────────────────────────────────────────────

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

// ── illegal / invalid chars ───────────────────────────────────────────

/** Insert illegal chars from empty → nothing accepted */
export const InsertIllegalCharsFromEmpty: Story = {
	render: () => <Fixture
		pattern="@n" label="empty → type abc → nothing accepted"
		initialValue={(void 0)}/>
};

/** Insert mixed illegal and valid chars → illegal filtered out */
export const InsertMixedIllegalChars: Story = {
	render: () => <Fixture
		pattern="@n" label="empty → type 1a2b3c → 1"
		initialValue={(void 0)}/>
};

// ── Branch A: decimal point in suffix ─────────────────────────────────

/** Insert digit when decimal point is in suffix (Branch A) */
export const InsertDigitBeforeDecimalInSuffix: Story = {
	render: () => <Fixture
		pattern="@nd5" label="12|.34 → insert 5 → 125.34"
		initialValue={12.34}/>
};

/** Insert minus when decimal point is in suffix (Branch A) */
export const InsertMinusBeforeDecimalInSuffix: Story = {
	render: () => <Fixture
		pattern="@nd5" label="|0.34 → insert - → -0.34"
		initialValue={0.34}/>
};

/** Insert minus before decimal in suffix with maxIntegerDigits=0 (Branch A) */
export const InsertMinusBeforeDecimalSuffixMaxIntZero: Story = {
	render: () => <Fixture
		pattern="@nd0f2" label="|0.5 → insert - → -0.5"
		initialValue={0.5}/>
};

// ── maxIntegerDigits=0 edge cases ─────────────────────────────────────

/** maxIntegerDigits=0 with existing prefix digit → cannot insert more */
export const MaxIntegerZeroWithExistingPrefix: Story = {
	render: () => <Fixture
		pattern="@nd0" label="maxIntegerDigits=0: 0| → insert 5 → rejected"
		initialValue={0}/>
};

/** maxIntegerDigits=0 with existing prefix → minus in middle rejected */
export const MaxIntegerZeroRejectMinusInMiddle: Story = {
	render: () => <Fixture
		pattern="@nd0" label="maxIntegerDigits=0: 0| → insert - → rejected"
		initialValue={0}/>
};

// ── negative + decimal ────────────────────────────────────────────────

/** Insert integer digit in a negative decimal number */
export const InsertDigitInNegativeDecimal: Story = {
	render: () => <Fixture
		pattern="@nd5f2" label="-2|.5 → insert 3 → -23.5"
		initialValue={-2.5}/>
};

// ── grouping separator in insert ──────────────────────────────────────

/** Insert a leading grouping separator → filtered out */
export const InsertLeadingGrouping: Story = {
	render: () => <Fixture
		pattern="@nug" label="empty → type ,123 → 123"
		initialValue={(void 0)}/>
};

// ── minus in suffix → reject all inserted (line 881-883) ─────────────────

/** Insert when minus is in suffix → all inserted rejected */
export const MinusInSuffixRejectsInsert: Story = {
	render: () => <Fixture
		pattern="@nd5" label="|-123 → insert 5 → rejected"
		initialValue={-123}/>
};

// ── Branch A: decimal point in suffix ↷ reject ─────────────────────────

/** Decimal in suffix, maxIntegerDigits=1 already full → reject more digits */
export const DecimalInSuffixMaxIntegerReached: Story = {
	render: () => <Fixture
		pattern="@nd1f2" label="|0.5 → insert 1 → rejected"
		initialValue={0.5}/>
};

// ── Branch B: decimal point in prefix ↷ reject ─────────────────────────

/** Decimal in prefix, maxFractionDigits reached → reject more digits */
export const DecimalInPrefixMaxFractionReached: Story = {
	render: () => <Fixture
		pattern="@nf2" label="1.2|3 → insert 5 → rejected"
		initialValue={1.23}/>
};

// ── maxIntegerDigits=0 edge cases (Branch C, line 1033-1036) ───────────

/** maxIntegerDigits=0, digit already in suffix → reject any insert */
export const MaxIntegerZeroDigitInSuffixRejectsInsert: Story = {
	render: () => <Fixture
		pattern="@nd0" label="|0 → insert 5 → rejected"
		initialValue={0}/>
};

// ── unsigned + decimal in suffix → minus rejected ───────────────────────

/** Unsigned, decimal in suffix, insert minus → filtered by legalCharsTillNot */
export const UnsignedDecimalInSuffixRejectsMinus: Story = {
	render: () => <Fixture
		pattern="@nuf2" label="|0.5 → insert - → rejected"
		initialValue={0.5}/>
};

// ── maxIntegerDigits finite, integer truncation (Branch C) ──────────────

/** Insert at position 0 when max integer digits already filled → digits dropped */
export const MaxIntegerReachedInsertAtStartDropped: Story = {
	render: () => <Fixture
		pattern="@nd3" label="|123 → insert 45 → rejected"
		initialValue={123}/>
};

/** Insert decimal + fraction when integer dropped → fraction also cleared */
export const MaxIntegerReachedInsertDecimalFractionCleared: Story = {
	render: () => <Fixture
		pattern="@nd3f2" label="|123 → insert 4.5 → 4.123"
		initialValue={123}/>
};

// ── legalCharsTillNot: leading grouping edge cases ──────────────────────

/** Leading grouping followed by minus → both filtered, nothing accepted */
export const LeadingGroupingFollowedByMinus: Story = {
	render: () => <Fixture
		pattern="@nug" label="empty → type ,-123 → rejected"
		initialValue={(void 0)}/>
};

/** Consecutive leading grouping separators → all skipped, digits kept */
export const ConsecutiveLeadingGrouping: Story = {
	render: () => <Fixture
		pattern="@nug" label="empty → type ,,123 → 123"
		initialValue={(void 0)}/>
};

// ── Branch A: decimal point already in suffix ───────────────────────────

/** Suffix already has decimal → inserting another decimal is rejected */
export const InsertDecimalWhenSuffixHasDecimal: Story = {
	render: () => <Fixture
		pattern="@nd5" label="12|.34 → insert . → rejected"
		initialValue={12.34}/>
};

/** Suffix has decimal + prefix has minus → inserting minus is rejected */
export const InsertMinusWhenSuffixHasDecimalAndPrefixHasMinus: Story = {
	render: () => <Fixture
		pattern="@nd5" label="-12|.34 → insert - → rejected"
		initialValue={-12.34}/>
};
