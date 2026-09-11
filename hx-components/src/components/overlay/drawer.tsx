import {HxOverlayDefaults} from './defaults';
import {HxOverlay} from './overlay';
import type {HxDrawerRole, HxOverlayProps} from './types';

export type HxDrawerPosition = 'top' | 'right' | 'bottom' | 'left';

export type HxDrawerProps =
	& Omit<HxOverlayProps, 'role' | 'data-hx-drawer'>
	& {
	/** toast position */
	position?: HxDrawerPosition;
}

const PositionToRole: Record<HxDrawerPosition, HxDrawerRole> = {
	'top': 'drawer-top',
	'right': 'drawer-right',
	'bottom': 'drawer-bottom',
	'left': 'drawer-left'
};

export const HxDrawer = (props: HxDrawerProps) => {
	const {position, ...rest} = props;

	const role = PositionToRole[position ?? HxOverlayDefaults.drawerPosition] ?? 'drawer-right';

	return <HxOverlay {...rest} role={role} data-hx-drawer=""/>;
};
