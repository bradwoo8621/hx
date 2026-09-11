import {HxOverlay} from './overlay';
import type {HxOverlayProps} from './types';

export type HxDialogProps = Omit<HxOverlayProps, 'role' | 'data-hx-dialog'>;

export const HxDialog = (props: HxDialogProps) => {
	return <HxOverlay {...props} role="dialog" data-hx-dialog=""/>;
};
