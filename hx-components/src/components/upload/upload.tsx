// @ts-expect-error import React
import React, {type ForwardedRef, forwardRef, type ReactElement, type RefAttributes} from 'react';
import {HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxUploadInner} from './inner';
import type {HxUploadInnerProps, HxUploadProps} from './types';
import {HxUploadProvider} from './upload-provider';

export type HxUploadType = <T extends object>(
	props: HxUploadProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const HxUpload =
	forwardRef(<T extends object>(props: HxUploadProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
		return <HxUploadProvider>
			<HxUploadInner {...props} $withCheck={false} ref={ref}/>
		</HxUploadProvider>;
	}) as unknown as HxUploadType;
// @ts-expect-error assign component name
HxUpload.displayName = 'HxUpload';

export type HxWithCheckUploadProps<T extends object> = Omit<HxUploadInnerProps<T>, '$domBox' | '$supplyOn'>;
export type HxWithCheckUploadType = <T extends object>(
	props: HxWithCheckUploadProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;
export const HxWithCheckUpload = forwardRef(<T extends object>(props: HxWithCheckUploadProps<T>, ref: ForwardedRef<HTMLDivElement>) => {
	return <HxUploadProvider>
		{/* @ts-expect-error ignore the $supplyOn type check */}
		<HxUploadInner {...props}
		               $supplyOn={HxWithCheckWithSingleFieldOptions.$supplyOn} $withCheck={true}
		               ref={ref}/>
	</HxUploadProvider>;
}) as unknown as HxWithCheckUploadType;
// @ts-expect-error assign component name
HxWithCheckUpload.displayName = 'HxWithCheckUpload';
