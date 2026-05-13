import {useEffect} from 'react';
import {HxConsole} from '../../utils';
import type {HxUploadVariant} from './types';

export const useAcceptCheck = (variant: HxUploadVariant, accept?: string | Array<string>) => {
	useEffect(() => {
		if (variant !== 'gallery') {
			return;
		}
		let warn = false;
		if (accept == null) {
			warn = true;
		}
		if (warn) {
			console.group('%c㊙️ HxUpload in gallery mode requires specifying the accept type, and the accept types must all be image formats.', HxConsole.warnMessageStyle);
			console.table({
				JPEG: {'MIME Type': 'image/jpeg, image/jpg', Extension: '.jpeg, .jpg'},
				PNG: {'MIME Type': 'image/png', Extension: '.png'},
				GIF: {'MIME Type': 'image/gif', Extension: '.gif'},
				WEBP: {'MIME Type': 'image/webp', Extension: '.webp'},
				BMP: {'MIME Type': 'image/bmp', Extension: '.bmp'},
				APNG: {'MIME Type': 'image/apng', Extension: '.apng'},
				AVIF: {'MIME Type': 'image/avif', Extension: '.avif'},
				'Any Image': {'MIME Type': 'image/*'}
			});
			console.groupEnd();
		}
	}, [variant, accept]);
};

export const computeAccept = (accept?: string | Array<string>): string | undefined => {
	let computed: string | undefined = (void 0);
	if (accept != null) {
		if (Array.isArray(accept)) {
			computed = accept.filter(accept => accept != null && accept.trim().length !== 0).join(',');
		} else {
			computed = accept.trim();
		}
		if (accept.length === 0) {
			computed = (void 0);
		}
	}
	return computed;
};