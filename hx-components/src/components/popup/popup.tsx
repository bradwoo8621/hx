import {type ReactNode, useEffect} from 'react';
import {useHxPopupContext} from './popup-provider.tsx';

export interface HxPopupProps {
	zIndex: number;
	gapToEdge: number;

	children: ReactNode;
}

export const HxPopup = (props: HxPopupProps) => {
	const {
		zIndex, //gapToEdge,
		children
	} = props;

	const popupContext = useHxPopupContext();

	useEffect(() => {
		const onShow = () => {
		};
		const onHide = () => {
		};
		popupContext.onShow(onShow);
		popupContext.onHide(onHide);
		return () => {
			popupContext.offShow(onShow);
			popupContext.offHide(onHide);
		};
	}, [popupContext]);

	return <div data-hx-popup="" style={{zIndex}}>
		{children}
	</div>;
};
