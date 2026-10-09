export const computeCellRowCssProperty = (row: number, rows: number): [number, number, string] => {
	if (rows == null || rows === 1) {
		const r = row ?? 1;
		return [r, r, String(r)];
	} else {
		const startRow = row ?? 1;
		const endRow = startRow + rows - 1;
		return [startRow, endRow, `${startRow} / span ${rows}`];
	}
};

export const computeCellColumnCssProperty = (col: number, cols: number): [number, number, string] => {
	if (cols == null || cols === 1) {
		const column = col ?? 1;
		return [column, column, String(column)];
	} else {
		const startColumn = col ?? 1;
		const endColumn = startColumn + cols - 1;
		return [startColumn, endColumn, `${startColumn} / span ${cols}`];
	}
};
