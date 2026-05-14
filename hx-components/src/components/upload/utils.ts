import {ERO} from '@hx/data';
import {HxConsole} from '../../utils';
import type {HxUploadFile, HxUploadImageType} from './types';

/**
 * split file name into base name and extension for separate styling.
 *
 * return base name and ext name. ext name could be undefined when not exists
 */
export const parseFileName = (file: HxUploadFile): [string, string | undefined] => {
	let baseName = file.name;
	let extName: string | undefined = (void 0);
	const extNameIndex = file.name.lastIndexOf('.');
	if (extNameIndex !== -1) {
		baseName = file.name.substring(0, extNameIndex);
		extName = file.name.substring(extNameIndex);
	}

	return [baseName, extName];
};

/**
 * map known error codes to i18n message keys; pass through custom messages as-is
 */
export const mapError = (hasUploadError: boolean, message?: string): string | undefined => {
	// map known error codes to i18n message keys; pass through custom messages as-is
	if (hasUploadError) {
		switch (message) {
			case 'over-max-size': {
				return '~HxCommon.UploadOverMaxSize';
			}
			case 'not-acceptable': {
				return '~HxCommon.UploadNotAcceptable';
			}
			case 'error': {
				return '~HxCommon.UploadError';
			}
			default: {
				return message;
			}
		}
	} else {
		return (void 0);
	}
};

// detect image format from magic bytes in the file header.
// returns the format name for use in toImageSrc, or false for non-image files.
export const isImage = (bytes?: Uint8Array<ArrayBuffer> | null): HxUploadImageType | false => {
	if (bytes == null) {
		return false;
	}

	// TIP typically, bytes won't be proxied,
	//  but seems storybook try to hold state in some case, and raise the following error
	//  TypeError: Method get TypedArray.prototype.length called on incompatible receiver [object Uint8Array]
	//  anyway, the weird thing is, after debugging, the bytes is in-memory,
	//  but there is no image previewed at all (img node exists, src attribute value exists, no image show), don't know why
	//  and is there any problem on not-storybook envs? need to test after all components developed.
	bytes = ERO.revoke<Uint8Array<ArrayBuffer>>(bytes);
	if (bytes.length < 12) {
		return false;
	}

	switch (bytes[0]) {
		case 0x00: {
			// [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]
			return (bytes[1] === 0x00 && bytes[2] === 0x00 && bytes[3] === 0x18 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) ? 'AVIF' : false;
		}
		case 0x42: {
			// [0x42, 0x4D]
			return bytes[1] === 0x4D ? 'BMP' : false;
		}
		case 0x52: {
			// [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]
			return (bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[4] === 0x00
				&& bytes[5] === 0x00 && bytes[6] === 0x00 && bytes[7] === 0x00 && bytes[8] === 0x57
				&& bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) ? 'WEBP' : false;
		}
		case 0x47: {
			// [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]}, // GIF87a
			// [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]}, // GIF89a
			return (bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 && bytes[5] === 0x61 && (bytes[4] === 0x37 || bytes[4] === 0x39)) ? 'GIF' : false;
		}
		case 0x89: {
			// [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
			if (bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 && bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A) {
				//  check acTL block (61 63 54 4C)
				let position = 8;
				while (position < bytes.length - 8) {
					const chunkLength = (bytes[position] << 24) |
						(bytes[position + 1] << 16) |
						(bytes[position + 2] << 8) |
						bytes[position + 3];

					const chunkType = String.fromCharCode(
						bytes[position + 4],
						bytes[position + 5],
						bytes[position + 6],
						bytes[position + 7]
					);

					if (chunkType === 'acTL') {
						return 'APNG';
					}

					if (chunkType === 'IDAT') {
						break;
					}

					position += chunkLength + 12;
				}
				return 'PNG';
			} else {
				return false;
			}
		}
		case 0xFF: {
			// [0xFF, 0xD8, 0xFF]
			return (bytes[1] === 0xD8 && bytes[2] === 0xFF) ? 'JPEG' : false;
		}
		default: {
			return false;
		}
	}
};

export const toImageSrc = (bytes: Uint8Array<ArrayBuffer>, type: Lowercase<HxUploadImageType>): string => {
	const blob = new Blob([bytes], {type: `image/${type}`});
	return URL.createObjectURL(blob);
};

export const releaseImage = (url: string) => {
	try {
		URL.revokeObjectURL(url);
	} catch {
		HxConsole.warn(`Failed to release image[${url}] by revoke object url.`);
	}
};
