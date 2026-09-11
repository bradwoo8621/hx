import {type ReactElement, type RefAttributes} from 'react';
import {HxInputBox} from '../input-box';
import {HxWithCheck, type HxWithCheckProps, HxWithCheckWithSingleFieldOptions} from '../with-check';
import {HxFormatInputDispatcher} from './dispatcher';
import type {HxFormatInputProps} from './types';

export type HxFormatInputType = <T extends object>(
	props: HxFormatInputProps<T> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

export const HxFormatInput = HxInputBox(HxFormatInputDispatcher) as unknown as HxFormatInputType;
// @ts-expect-error assign component name
HxFormatInput.displayName = 'HxFormatInput';

export type HxWithCheckFormatInputType = <T extends object>(
	props: HxWithCheckProps<T, HxFormatInputProps<T>> & RefAttributes<HTMLInputElement>
) => ReactElement | null;
export const HxWithCheckFormatInput = HxWithCheck(HxFormatInput, HxWithCheckWithSingleFieldOptions) as unknown as HxWithCheckFormatInputType;
// @ts-expect-error assign component name
HxWithCheckFormatInput.displayName = 'HxWithCheckFormatInput';
