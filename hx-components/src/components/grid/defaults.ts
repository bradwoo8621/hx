import type {
	HxGridBorderRadius,
	HxGridColumns,
	HxGridGapX,
	HxGridGapY,
	HxGridPaddingB,
	HxGridPaddingT,
	HxGridPaddingX
} from './grid';

export interface HxGridSettings {
	columns?: HxGridColumns;
	border?: boolean;
	borderRadius?: HxGridBorderRadius;
	gapX?: HxGridGapX;
	gapY?: HxGridGapY;
	paddingX?: HxGridPaddingX;
	paddingT?: HxGridPaddingT;
	paddingB?: HxGridPaddingB;
}

export const HxGridDefaults: Required<HxGridSettings> = {
	columns: 12,
	border: false,
	borderRadius: 'md',
	gapX: 'md',
	gapY: 'none',
	paddingX: 'none',
	paddingT: 'none',
	paddingB: 'none'
};

export const configHxGrid = (settings: HxGridSettings) => {
	HxGridDefaults.columns = settings.columns ?? HxGridDefaults.columns;
	HxGridDefaults.border = settings.border ?? HxGridDefaults.border;
	HxGridDefaults.borderRadius = settings.borderRadius?.trim() as HxGridBorderRadius || HxGridDefaults.borderRadius;
	HxGridDefaults.gapX = settings.gapX?.trim() as HxGridGapX || HxGridDefaults.gapX;
	HxGridDefaults.gapY = settings.gapY?.trim() as HxGridGapY || HxGridDefaults.gapY;
	HxGridDefaults.paddingX = settings.paddingX?.trim() as HxGridPaddingX || HxGridDefaults.paddingX;
	HxGridDefaults.paddingT = settings.paddingT?.trim() as HxGridPaddingT || HxGridDefaults.paddingT;
	HxGridDefaults.paddingB = settings.paddingB?.trim() as HxGridPaddingB || HxGridDefaults.paddingB;
};
