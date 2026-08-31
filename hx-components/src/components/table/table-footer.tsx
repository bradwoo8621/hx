// @ts-expect-error import React
import React from 'react';

export const HxTableFooter = () => {
	return <>
		<div data-hx-table-footer="start"/>

		<div data-hx-table-footer="end"/>
	</>;
};
