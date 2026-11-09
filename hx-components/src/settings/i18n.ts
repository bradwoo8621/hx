/** en version */
export const HxI18NDefaults = {
	HxCommon: {
		OkButton: 'Ok',
		SaveButton: 'Save',
		SubmitButton: 'Submit',
		ApplyButton: 'Apply',
		CancelButton: 'Cancel',
		DiscardButton: 'Discard',
		CloseButton: 'Close',
		DismissButton: 'Dismiss',
		YesButton: 'Yes',
		NoButton: 'No',
		ClearButton: 'Clear',

		SortAsc: 'Asc',
		SortDesc: 'Desc',

		InputPlaceholder: 'Input here...',

		SelectPlaceholder: 'Please select...',
		SelectFilterPlaceholder: 'Filter...',
		SelectOptionsOnLoad: 'Options on loading...',
		SelectNoOptions: 'No options',

		// datetime picker
		DtpPlaceholder: 'Pick a...',
		DtpTodayButton: 'Today',
		DtpNowButton: 'Now',
		DtpStartOfDayButton: 'Start',
		DtpNoonOfDayButton: 'Noon',
		DtpEndOfDayButton: 'End',

		TableNoData: 'No Data.',
		TableFuzzyPlaceholder: '"a b,c" means "a or (b and c)".',
		TableNoSortColumn: 'No sorted column',
		TableAddSortPlaceholder: 'Select a sort column...',
		TableNoMoreSortColumn: 'No more column',
		TableFilterMatch: 'is',
		TableFilterNotMatch: 'is not',
		TableFilterBetween: 'between',
		TableFilterNotBetween: 'not between',
		TableClearCriteria: 'Clear All',

		OfTotalPages: '/',
		PerPage: '/ Page',
		TotalItems1: 'Total',
		TotalItems2: 'Items',
		TotalComma: ',',

		ButtonUpload: 'Upload',
		GalleryUpload: 'Upload',
		DndUpload: 'Click or drag file to this area to upload',
		UploadOverMaxSize: 'Over max file size.',
		UploadOverMaxCount: 'Over max file count, ignored.',
		UploadNotAcceptable: 'File type not acceptable.',
		UploadReadFileError: 'Failed to read file, ignored.',
		UploadError: 'Upload failed.'
	} as const
} as const;
