/** follow dayjs format, only date part is allowed */
export type HxDateFormat = string;
/** follow dayjs format, only time part is allowed */
export type HxTimeFormat = string;
/** follow dayjs format */
export type HxDateTimeFormat = string;

export type HxDateTimeRelatedFormat = HxDateFormat | HxTimeFormat | HxDateTimeFormat;
