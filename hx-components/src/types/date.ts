/**
 * y: 4 digits year
 * m: 2 digits month
 * d: 2 digits day
 * h: 2 digits hour
 * n: 2 digits minute
 * s: 2 digits second
 * any other chars will be kept as is
 */
export type HxDateFormat = string;
/**
 * y: 4 digits year
 * m: 2 digits month
 * d: 2 digits day
 * hns: not allowed
 * any other chars will be kept as is
 */
export type HxTimeFormat = string;
/**
 * ymd: not allowed
 * h: 2 digits hour
 * n: 2 digits minute
 * s: 2 digits second
 * any other chars will be kept as is
 */
export type HxDateTimeFormat = string;

export type HxDateTimeRelatedFormat = HxDateFormat | HxTimeFormat | HxDateTimeFormat;
