import type { Meta, StoryObj } from "@storybook/react-vite";
// @ts-expect-error import React
import React from "react";
import {
  HxFormatInput,
  HxModelDateFormat,
  HxModelDateTimeFormat,
  HxModelTimeFormat,
} from "../../src";
import { Fixture } from "./format-input-datetime.shared";

const meta: Meta<typeof HxFormatInput> = {
  title: "Components/Basic/Format Input - DateTime/Replace All",
  component: HxFormatInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

// noinspection JSUnusedGlobalSymbols
export default meta;

type Story = StoryObj<typeof HxFormatInput>;

// ── Full value replace ───────────────────────────────────────────────────

/** Select all and type a complete date — display reformats */
export const ReplaceAllFullDate: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type 2025/12/25 → 2025/12/25"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};

/** Select all and type a complete time */
export const ReplaceAllFullTime: Story = {
  render: () => (
    <Fixture
      pattern="@d:hns"
      label="14:30:00 → select all → type 09:15:45 → 09:15:45"
      valueFormat={HxModelTimeFormat}
      initialValue="14:30:00"
    />
  ),
};

/** Select all and type a complete datetime */
export const ReplaceAllFullDateTime: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd :hns"
      label="2024/06/10 14:30:00 → select all → type 2025/12/25 09:15:45 → 2025/12/25 09:15:45"
      valueFormat="y/m/d h:n:s"
      initialValue="2024/06/10 14:30:00"
    />
  ),
};

/** Select all and type a date with dash separators — display uses pattern separator */
export const ReplaceAllDashSeparatorDate: Story = {
  render: () => (
    <Fixture
      pattern="@d-ymd"
      label="2024-06-10 → select all → type 2025-12-25 → 2025-12-25"
      valueFormat="y-m-d"
      initialValue="2024-06-10"
    />
  ),
};

// ── Partial value replace ────────────────────────────────────────────────

/** Select all and type only a year — remaining fields show placeholders */
export const ReplaceAllYearOnly: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type 2025 → 2025/__/__ (caret after 2025)"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};

/** Select all and type year-month only — day shows placeholder */
export const ReplaceAllYearMonth: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type 2025/03 → 2025/03/__ (caret after 03)"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};

/** Select all and type only hour — remaining fields show placeholders */
export const ReplaceAllHourOnly: Story = {
  // TODO
  render: () => (
    <Fixture
      pattern="@d:hns"
      label="14:30:00 → select all → type 9 → 9_:__:__ (caret after 9)"
      valueFormat={HxModelTimeFormat}
      initialValue="14:30:00"
    />
  ),
};

/** Select all and type hour-minute only — seconds show placeholder */
export const ReplaceAllHourMinute: Story = {
  render: () => (
    <Fixture
      pattern="@d:hns"
      label="14:30:00 → select all → type 09:15 → 09:15:__ (caret after 15)"
      valueFormat={HxModelTimeFormat}
      initialValue="14:30:00"
    />
  ),
};

/** Select all and type a partial datetime — unparsed fields show placeholders */
export const ReplaceAllPartialDateTime: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd :hns"
      label="2024/06/10 14:30:00 → select all → type 2025/12/25 09 → 2025/12/25 09:__:__ (caret after 09)"
      valueFormat="y/m/d h:n:s"
      initialValue="2024/06/10 14:30:00"
    />
  ),
};

// ── Compact format replace ───────────────────────────────────────────────

/** Select all and type a compact date (no separators) */
export const ReplaceAllCompactDate: Story = {
  render: () => (
    <Fixture
      pattern="@dymd"
      label="20240610 → select all → type 20251225 → 20251225"
      valueFormat="ymd"
      initialValue="20240610"
    />
  ),
};

/** Select all and type a compact time (no separators) */
export const ReplaceAllCompactTime: Story = {
  render: () => (
    <Fixture
      pattern="@dhns"
      label="143000 → select all → type 091545 → 091545"
      valueFormat="hns"
      initialValue="143000"
    />
  ),
};

/** Select all and type compact date into separator pattern */
export const ReplaceAllCompactIntoSeparatorPattern: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type 20251225 → 2025/12/25"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};

/** Select all and type compact time into separator pattern */
export const ReplaceAllCompactTimeIntoSeparatorPattern: Story = {
  render: () => (
    <Fixture
      pattern="@d:hns"
      label="14:30:00 → select all → type 091545 → 09:15:45"
      valueFormat={HxModelTimeFormat}
      initialValue="14:30:00"
    />
  ),
};

// ── Different separator between input and pattern ────────────────────────

/** Select all and type date with dash separators into slash pattern — display uses slashes */
export const ReplaceAllDashIntoSlashPattern: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type 2025-12-25 → 2025/12/25"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};

/** Select all and type date with dot separators into slash pattern */
export const ReplaceAllDotIntoSlashPattern: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type 2025.12.25 → 2025/12/25"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};

// ── Replace with blank / invalid ─────────────────────────────────────────

/** Select all and type blank — old value stays unchanged */
export const ReplaceAllBlankKeepsOld: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type '' → 2024/06/10 (unchanged)"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};

/** Select all and type only whitespace — old value stays unchanged */
export const ReplaceAllWhitespaceKeepsOld: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type '   ' → 2024/06/10 (unchanged)"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};

/** Select all and type non-date string — old value stays unchanged */
export const ReplaceAllNonDateStringKeepsOld: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type 'hello' → 2024/06/10 (unchanged)"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};

/** Select all and type text with numbers but invalid structure */
export const ReplaceAllGarbledTextKeepsOld: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type '12x34y56' → 12__/__/__ (caret after 2)"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};

// ── Single digit / edge cases ────────────────────────────────────────────

/** Select all and type a single digit — placed at the start of the first field */
export const ReplaceAllSingleDigit: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type '2' → 2___/__/__ (caret after 2)"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};

/** Select all and type single digit into time pattern */
export const ReplaceAllSingleDigitTime: Story = {
  render: () => (
    <Fixture
      pattern="@d:hns"
      label="14:30:00 → select all → type '5' → 5_:__:__ (caret after 5)"
      valueFormat={HxModelTimeFormat}
      initialValue="14:30:00"
    />
  ),
};

// ── Replace on datetime pattern ──────────────────────────────────────────

/** On datetime pattern, select all and type only a date — time fields show placeholders */
export const ReplaceAllDateTimePatternDateOnly: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd :hns"
      label="2024/06/10 14:30:00 → select all → type 2025/12/25 → 2025/12/25 __:__:__ (caret after 25)"
      valueFormat={HxModelDateTimeFormat}
      initialValue="2024/06/10T14:30:00"
    />
  ),
};

/** On datetime pattern, select all and type only a time — date fields show placeholders */
export const ReplaceAllDateTimePatternTimeOnly: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd :hns"
      label="2024/06/10 14:30:00 → select all → type 09:15:45 → 09__/__/__ __:__:__ (caret after 09)"
      valueFormat={HxModelDateTimeFormat}
      initialValue="2024/06/10T14:30:00"
    />
  ),
};

/** Select all and replace datetime with day-first pattern */
export const ReplaceAllDateTimeDayFirst: Story = {
  render: () => (
    <Fixture
      pattern="@d/d-m-y h:n"
      label="10-06-2024 14:30 → select all → type 25-12-2025 09:15 → 25-12-2025 09:15"
      valueFormat="d-m-y h:n"
      initialValue="10-06-2024 14:30"
    />
  ),
};

// ── Replace with extra chars / overflow ──────────────────────────────────

/** Select all and type date with extra chars at the end — extra chars are ignored */
export const ReplaceAllExtraTrailingChars: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type 2025/12/25extra → 2025/12/25 (extra chars collected)"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};

/** Select all and type date with leading text — legal chars collected from the start */
export const ReplaceAllLeadingText: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type 'abc2025/12/25' → 2024/06/10 (unchanged)"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};

// ── valueFormat with extra fields + defaults ─────────────────────────────

/** Replace all when valueFormat has fields beyond the pattern — defaults fill missing parts, caret based on display format */
export const ReplaceAllWithExtraFieldsDefault: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label='model: 2024/06/10 + defaults "h12n0s0" → select all → type 2025/12/25 → display: 2025/12/25 (caret after 25)'
      valueFormat="y/m/d h:n:s"
      defaultValues="h12n0s0"
      initialValue="2024/06/10"
    />
  ),
};

/** Replace all with custom non-zero defaults — pattern lacks fields present in valueFormat */
export const ReplaceAllWithCustomNonZeroDefaults: Story = {
  render: () => (
    <Fixture
      pattern="@d:hns"
      label='model: 14:30:00 + defaults "y2024m1d1" → select all → type 09:15:45 → display: 09:15:45 (caret after 45)'
      valueFormat="y/m/d h:n:s"
      defaultValues="y2024m1d1"
      initialValue="14:30:00"
    />
  ),
};

// ── Month-day / day-month patterns ───────────────────────────────────────

/** Select all and replace month-day pattern */
export const ReplaceAllMonthDay: Story = {
  render: () => (
    <Fixture
      pattern="@d/md"
      label="06/10 → select all → type 12/25 → 12/25"
      valueFormat="m/d"
      initialValue="06/10"
    />
  ),
};

/** Select all and replace day-month pattern */
export const ReplaceAllDayMonth: Story = {
  render: () => (
    <Fixture
      pattern="@d/dm"
      label="10/06 → select all → type 25/12 → 25/12"
      valueFormat="d/m"
      initialValue="10/06"
    />
  ),
};

// ── Single-field / partial patterns ──────────────────────────────────────

/** Select all and replace year-only pattern */
export const ReplaceAllYearOnlyPattern: Story = {
  render: () => (
    <Fixture
      pattern="@d/y"
      label="2024 → select all → type 2025 → 2025"
      valueFormat="y"
      initialValue="2024"
    />
  ),
};

/** Select all and replace minute-second pattern */
export const ReplaceAllMinuteSecond: Story = {
  render: () => (
    <Fixture
      pattern="@d:ns"
      label="30:45 → select all → type 15:20 → 15:20"
      valueFormat="n:s"
      initialValue="30:45"
    />
  ),
};

// ── Different separator in valueFormat from pattern ──────────────────────

/** Model has dash separator, pattern has slash — replace all parses against display format (slash) */
export const ReplaceAllModelDashDisplaySlash: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="model: 2024-06-10, display: 2024/06/10 → select all → type 2025-12-25 → model: 2025-12-25, display: 2025/12/25"
      valueFormat="y-m-d"
      initialValue="2024-06-10"
    />
  ),
};

// ── Replace from invalid initial state ───────────────────────────────────

/** Select all on invalid display value and type valid date — display becomes valid */
export const ReplaceAllInvalidToValid: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/x6/10 → select all → type 2025/12/25 → 2025/12/25"
      valueFormat={HxModelDateFormat}
      initialValue="2024/x6/10"
    />
  ),
};

// ── Chinese / letter separators ──────────────────────────────────────────

/** Select all and type Chinese date format into pattern with slashes */
export const ReplaceAllChineseSeparators: Story = {
  render: () => (
    <Fixture
      pattern="@d/ymd"
      label="2024/06/10 → select all → type 2025年12月25日 → 2025/__/__ (caret after 25)"
      valueFormat={HxModelDateFormat}
      initialValue="2024/06/10"
    />
  ),
};
