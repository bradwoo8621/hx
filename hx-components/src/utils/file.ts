const K500 = 1024 * 512;

export const fileSizeToStr = (size?: number): [number, string] => {
	if (size == null) {
		return [0, 'B'];
	} else if (size < 128) {
		return [size, 'B'];
	} else if (size < K500) {
		return [size / 1024, 'kb'];
	} else {
		return [size / 1024 / 1024, 'mb'];
	}
};