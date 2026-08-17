/**
 * A timezone-free date/time wrapper around the JavaScript {@link Date}.
 *
 * <p>Every getter and setter operates in <b>UTC</b> semantics — there is no
 * local-timezone conversion anywhere. This makes the object suitable for
 * calendar arithmetic that must produce identical results on every machine
 * regardless of the host timezone (e.g. the ICU `'islamic'` astronomical
 * calendar, whose day boundaries are timezone-sensitive).</p>
 *
 * <p><b>How a "local" `new Date()` becomes a {@link UTCDate}:</b>
 * {@link UTCDate.now()} reads the <i>local clock readings</i> of the current
 * instant (year/month/day/hours/minutes/seconds/ms) and re-assembles them as
 * <i>UTC</i> components — the local wall-clock is treated as if it were UTC.
 * This is the bridge from "local calendar day" semantics to "UTC day"
 * semantics: the resulting instant's UTC date equals the original local date.</p>
 *
 * <p><b>Default time-of-day handling (per factory):</b></p>
 * <ul>
 * <li>{@link UTCDate.now()} — carries the <b>current</b> hours/minutes/seconds/ms
 *     of the local clock (never zeroed).</li>
 * <li>{@link UTCDate.of} / {@link UTCDate.startOfDay} — hours, minutes,
 *     seconds and ms <b>default to 0</b> (UTC midnight).</li>
 * <li>{@link UTCDate.endOfDay} — fixed at <b>23:59:59.999</b>.</li>
 * <li>{@link UTCDate.ofTimestamp} — the given epoch-millisecond timestamp is
 *     used <b>as-is</b>; no timezone conversion is applied.</li>
 * </ul>
 */
export class UTCDate {
	private readonly utc: Date;

	/**
	 * Creates a {@link UTCDate}.
	 *
	 * <ul>
	 * <li>no argument — same as {@link UTCDate.now()}: the <b>current</b> local
	 *     wall-clock readings are re-assembled as UTC, including the current
	 *     hours/minutes/seconds/ms.</li>
	 * <li>{@link UTCDate} — a clone of the given instance.</li>
	 * <li>{@link Number} — the epoch-millisecond timestamp, used as-is (same as
	 *     {@link UTCDate.ofTimestamp}).</li>
	 * </ul>
	 */
	private constructor(date?: UTCDate | number) {
		if (date == null) {
			// Read the current local wall-clock readings (including time-of-day)
			// and re-assemble them as UTC components — the local clock is treated
			// as if it were UTC, so the host timezone never affects the instant.
			const d = new Date();
			const year = d.getFullYear();
			const monthIndex = d.getMonth();
			const dateOfMonth = d.getDate();
			const timestamp = Date.UTC(year, monthIndex, dateOfMonth, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
			this.utc = new Date(timestamp);
			if (year < 100) {
				this.utc.setUTCFullYear(year, monthIndex, dateOfMonth);
			}
		} else if (date instanceof UTCDate) {
			this.utc = date.cloneAsJsDate();
		} else {
			this.utc = new Date(date);
		}
	}

	/**
	 * Creates a {@link UTCDate} of the current instant.
	 *
	 * <p>Reads the local clock readings of `new Date()` (including
	 * hours/minutes/seconds/ms) and re-assembles them as UTC — the local
	 * wall-clock is treated as if it were UTC. The resulting instant's UTC
	 * year/month/day/hours/... equal the original <b>local</b> readings.</p>
	 *
	 * @returns the current local wall-clock, expressed in UTC
	 */
	static now(): UTCDate {
		return new UTCDate();
	}

	/**
	 * Clones the given {@link UTCDate}.
	 *
	 * @param date - the instance to clone
	 * @returns an independent copy with the same instant
	 */
	static cloneOf(date: UTCDate): UTCDate {
		return new UTCDate(date);
	}

	/**
	 * Creates a {@link UTCDate} from an epoch-millisecond timestamp.
	 *
	 * <p>The timestamp is used <b>as-is</b> — it already encodes an absolute
	 * instant, so no timezone conversion is applied.</p>
	 *
	 * @param timestamp - epoch milliseconds
	 * @returns a {@link UTCDate} of that instant
	 */
	static ofTimestamp(timestamp: number): UTCDate {
		return new UTCDate(timestamp);
	}

	/**
	 * Creates a {@link UTCDate} from UTC components.
	 *
	 * <p><b>Default time-of-day:</b> hours, minutes, seconds and ms all
	 * <b>default to 0</b> — calling only with `year`/`monthIndex`/
	 * `dateOfMonth` yields <b>UTC midnight</b> (00:00:00.000) of that date.</p>
	 *
	 * <p>All values are interpreted as UTC; the host timezone is never
	 * consulted.</p>
	 *
	 * @param year         - full year (e.g. 2026). Values 0–99 are normalized
	 *                       automatically — the {@link Date.UTC} legacy mapping
	 *                       (0–99 → 1900–1999) is corrected internally via
	 *                       {@link Date#setUTCFullYear}.
	 * @param monthIndex   - month, 0-based (0 = January)
	 * @param dateOfMonth  - day of month, 1-based
	 * @param hours        - hours, defaults to 0
	 * @param minutes      - minutes, defaults to 0
	 * @param seconds      - seconds, defaults to 0
	 * @param ms           - milliseconds, defaults to 0
	 * @returns the constructed {@link UTCDate}
	 */
	static of(year: number, monthIndex: number, dateOfMonth: number, hours: number = 0, minutes: number = 0, seconds: number = 0, ms: number = 0): UTCDate {
		const date = new UTCDate(Date.UTC(year, monthIndex, dateOfMonth, hours, minutes, seconds, ms));
		if (year < 100) {
			date.setDatePart(year, monthIndex, dateOfMonth);
		}
		return date;
	}

	/**
	 * Creates a {@link UTCDate} at <b>UTC midnight</b> (00:00:00.000) of the
	 * given UTC date.
	 *
	 * <p>Equivalent to {@link UTCDate.of} with all time-of-day components
	 * defaulting to 0.</p>
	 *
	 * @param year        - full year
	 * @param monthIndex  - month, 0-based
	 * @param dateOfMonth - day of month, 1-based
	 * @returns UTC midnight of the given date
	 */
	static startOfDay(year: number, monthIndex: number, dateOfMonth: number): UTCDate {
		return UTCDate.of(year, monthIndex, dateOfMonth);
	}

	/**
	 * Creates a {@link UTCDate} at the <b>last millisecond of the day</b>
	 * (23:59:59.999) of the given UTC date.
	 *
	 * @param year        - full year
	 * @param monthIndex  - month, 0-based
	 * @param dateOfMonth - day of month, 1-based
	 * @returns 23:59:59.999 of the given date
	 */
	static endOfDay(year: number, monthIndex: number, dateOfMonth: number): UTCDate {
		return UTCDate.of(year, monthIndex, dateOfMonth, 23, 59, 59, 999);
	}

	/**
	 * Returns the UTC year.
	 *
	 * @returns the year in UTC
	 */
	getFullYear(): number {
		return this.utc.getUTCFullYear();
	}

	/**
	 * Sets the UTC year/month/day.
	 *
	 * <p><b>Time-of-day is preserved:</b> the current UTC hours/minutes/
	 * seconds/ms are kept unchanged (this delegates to
	 * {@link Date#setUTCFullYear}).</p>
	 *
	 * @param year        - full year. Unlike {@link UTCDate.of}, this setter
	 *                      has <b>no</b> 0–99 legacy mapping — pre-100 years
	 *                      (e.g. 1) are stored correctly.
	 * @param monthIndex  - month, 0-based
	 * @param dateOfMonth - day of month, 1-based
	 * @returns `this` for chaining
	 */
	setDatePart(year: number, monthIndex: number, dateOfMonth: number): this {
		this.utc.setUTCFullYear(year, monthIndex, dateOfMonth);
		return this;
	}

	/**
	 * Returns the UTC month, 0-based.
	 *
	 * @returns the month in UTC (0 = January)
	 */
	getMonthIndex(): number {
		return this.utc.getUTCMonth();
	}

	/**
	 * Returns the UTC day of month, 1-based.
	 *
	 * @returns the day of month in UTC
	 */
	getDayOfMonth(): number {
		return this.utc.getUTCDate();
	}

	/**
	 * Sets the UTC day of month.
	 *
	 * <p>Year, month and <b>time-of-day are preserved</b>; only the day
	 * changes (this delegates to {@link Date#setUTCDate}).</p>
	 *
	 * @param dateOfMonth - day of month, 1-based
	 * @returns `this` for chaining
	 */
	setDayOfMonth(dateOfMonth: number): this {
		this.utc.setUTCDate(dateOfMonth);
		return this;
	}

	/**
	 * Sets the UTC time-of-day.
	 *
	 * <p><b>All four arguments are effectively required.</b> Because `ms`
	 * defaults to 0, every call forwards four values to
	 * {@link Date#setUTCHours}; passing fewer than three arguments makes the
	 * omitted ones `undefined`, which {@link Date#setUTCHours} converts to
	 * {@link NaN} and corrupts the date (subsequent reads throw
	 * {@link RangeError}). Unlike the native {@link Date#setUTCHours}, omitted
	 * arguments do <b>not</b> keep their current value.</p>
	 *
	 * <p><b>Default time-of-day:</b> `ms` defaults to 0; hours, minutes and
	 * seconds have <b>no</b> defaults and must always be provided.</p>
	 *
	 * @param hours   - the hours to set (UTC)
	 * @param minutes - the minutes to set (UTC)
	 * @param seconds - the seconds to set (UTC)
	 * @param ms      - the milliseconds to set (UTC), defaults to 0
	 * @returns `this` for chaining
	 */
	// noinspection JSUnusedGlobalSymbols
	setTimePart(hours: number, minutes: number, seconds: number, ms: number = 0): this {
		this.utc.setUTCHours(hours, minutes, seconds, ms);
		return this;
	}

	/**
	 * Returns the UTC hours (0–23).
	 *
	 * @returns the hours in UTC
	 */
	getHours(): number {
		return this.utc.getUTCHours();
	}

	/**
	 * Returns the UTC minutes (0–59).
	 *
	 * @returns the minutes in UTC
	 */
	getMinutes(): number {
		return this.utc.getUTCMinutes();
	}

	/**
	 * Returns the UTC seconds (0–59).
	 *
	 * @returns the seconds in UTC
	 */
	getSeconds(): number {
		return this.utc.getUTCSeconds();
	}

	/**
	 * Returns the UTC day of week (0 = Sunday, 6 = Saturday).
	 *
	 * @returns the day of week in UTC
	 */
	getDay(): number {
		return this.utc.getUTCDay();
	}

	/**
	 * Returns the epoch-millisecond timestamp of this instant.
	 *
	 * @returns epoch milliseconds
	 */
	getTime(): number {
		return this.utc.getTime();
	}

	/**
	 * Truncates the time-of-day to <b>UTC midnight</b> (00:00:00.000).
	 *
	 * <p>Year/month/day are preserved; hours/minutes/seconds/ms are zeroed
	 * (this delegates to {@link Date#setUTCHours}).</p>
	 *
	 * @returns `this` for chaining
	 */
	toStartOfDay(): this {
		this.utc.setUTCHours(0, 0, 0, 0);
		return this;
	}

	/**
	 * Sets the time-of-day to the <b>last millisecond of the day</b>
	 * (23:59:59.999).
	 *
	 * <p>Year/month/day are preserved (this delegates to
	 * {@link Date#setUTCHours}).</p>
	 *
	 * @returns `this` for chaining
	 */
	// noinspection JSUnusedGlobalSymbols
	toEndOfDay(): this {
		this.utc.setUTCHours(23, 59, 59, 999);
		return this;
	}

	/**
	 * Returns a cloned plain JavaScript {@link Date} of the same instant.
	 *
	 * @returns a new {@link Date} with identical epoch milliseconds
	 */
	cloneAsJsDate(): Date {
		return new Date(this.utc);
	}

	/**
	 * Returns the string representation of the underlying instant in the host
	 * timezone (the native {@link Date#toString} output; the instant itself is
	 * unaffected).
	 *
	 * @returns the host-timezone string representation
	 */
	toString(): string {
		return this.utc.toString();
	}

	/**
	 * Returns the date portion of {@link toString} in the host timezone.
	 *
	 * @returns the date-only string representation
	 */
	// noinspection JSUnusedGlobalSymbols
	toDateString(): string {
		return this.utc.toDateString();
	}

	/**
	 * Returns the time portion of {@link toString} in the host timezone.
	 *
	 * @returns the time-only string representation
	 */
	// noinspection JSUnusedGlobalSymbols
	toTimeString(): string {
		return this.utc.toTimeString();
	}

	/**
	 * Returns the string representation of the underlying instant in UTC.
	 *
	 * @returns the UTC string representation
	 */
	// noinspection JSUnusedGlobalSymbols
	toUTCString(): string {
		return this.utc.toUTCString();
	}

	/**
	 * Returns the ISO 8601 string representation of the underlying instant in UTC.
	 *
	 * @returns the ISO 8601 string representation
	 */
	toISOString(): string {
		return this.utc.toISOString();
	}

	/**
	 * Returns a locale-sensitive string representation of the underlying instant
	 * in the host timezone.
	 *
	 * @returns the localized string representation
	 */
	// noinspection JSUnusedGlobalSymbols
	toLocaleString(): string {
		return this.utc.toLocaleString();
	}

	/**
	 * Returns the locale-sensitive date portion of {@link toLocaleString}.
	 *
	 * @returns the localized date-only string representation
	 */
	// noinspection JSUnusedGlobalSymbols
	toLocaleDateString(): string {
		return this.utc.toLocaleDateString();
	}

	/**
	 * Returns the locale-sensitive time portion of {@link toLocaleString}.
	 *
	 * @returns the localized time-only string representation
	 */
	// noinspection JSUnusedGlobalSymbols
	toLocaleTimeString(): string {
		return this.utc.toLocaleTimeString();
	}
}
