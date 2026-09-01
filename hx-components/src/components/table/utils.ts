export const computeCellRowCssProperty = (row: number, rows: number): string => {
	if (rows == null || rows === 1) {
		return String(row ?? 1);
	} else {
		return `${row ?? 1} / span ${rows}`;
	}
};

export const computeCellColumnCssProperty = (col: number, cols: number): string => {
	if (cols == null || cols === 1) {
		return String(col ?? 1);
	} else {
		return `${col ?? 1} / span ${cols}`;
	}
};
