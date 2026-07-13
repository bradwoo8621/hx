/** Weekday name i18n keys (2 chars) in order (0 = Sunday) */
export const WeekdayC2Keys: Array<string> = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

/** Month name i18n keys (3 chars) in order (1 = January) */
export const MonthC2Keys: Array<string> = [
	'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

/** en version */
export const HxI18NDefaults = {
	HxCommon: {
		SelectPlaceholder: 'Please select...',
		SelectFilterPlaceholder: 'Filter...',
		SelectOptionsOnLoad: 'Options on loading...',
		SelectNoOptions: 'No options',

		DateTimePickerPlaceholder: 'Pick a...',

		OkButton: 'Ok',
		CancelButton: 'Cancel',
		DiscardButton: 'Discard',
		CloseButton: 'Close',
		DismissButton: 'Dismiss',
		YesButton: 'Yes',
		NoButton: 'No',
		ClearButton: 'Clear',
		TodayButton: 'Today',
		NowButton: 'Now',

		PerPage: '/ Page',
		TotalItems1: 'Total',
		TotalItems2: 'Items',

		ButtonUpload: 'Upload',
		GalleryUpload: 'Upload',
		DndUpload: 'Click or drag file to this area to upload',
		UploadOverMaxSize: 'Over max file size.',
		UploadOverMaxCount: 'Over max file count, ignored.',
		UploadNotAcceptable: 'File type not acceptable.',
		UploadReadFileError: 'Failed to read file, ignored.',
		UploadError: 'Upload failed.',

		Weekday: {
			Su: 'Su',
			Mo: 'Mo',
			Tu: 'Tu',
			We: 'We',
			Th: 'Th',
			Fr: 'Fr',
			Sa: 'Sa'
		},

		Month: {
			Jan: 'Jan',
			Feb: 'Feb',
			Mar: 'Mar',
			Apr: 'Apr',
			May: 'May',
			Jun: 'Jun',
			Jul: 'Jul',
			Aug: 'Aug',
			Sep: 'Sep',
			Oct: 'Oct',
			Nov: 'Nov',
			Dec: 'Dec'
		}

	} as const
} as const;
