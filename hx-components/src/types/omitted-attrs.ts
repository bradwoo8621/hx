export type StdOmittedDataAttributes =
// component type
	| 'data-hx-input'
	// standard component attributes
	| 'data-hx-visible' | 'data-hx-disabled' | 'data-hx-readonly';

export type StdOmittedValueAttributes =
	| 'disabled'
	| 'readOnly'
	| 'type'
	| 'value';

export type StdOmittedEventAttributes =
	| 'onChange';

export type StdOmittedAttributes =
	| StdOmittedDataAttributes
	| StdOmittedValueAttributes
	| StdOmittedEventAttributes;
