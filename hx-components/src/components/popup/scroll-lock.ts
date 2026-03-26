type HandleScrollEvent = TouchEvent;

interface BodyPosition {
	position: CSSStyleDeclaration['position'],
	top: CSSStyleDeclaration['top'],
	left: CSSStyleDeclaration['left']
}

/**
 * The codebase originates from // https://github.com/willmcpo/body-scroll-lock
 */
export class BodyScrollLock {
	private static hasPassiveEvents: boolean = false;
	private static readonly isIosDevice = BodyScrollLock.checkIOSDevice();

	public static reserveScrollBarGap: boolean = false;

	private static previousBodyOverflow: CSSStyleDeclaration['overflow'] | undefined;
	private static previousBodyPaddingRight: CSSStyleDeclaration['paddingRight'] | undefined;
	private static previousBodyPosition: BodyPosition | undefined;

	private static popupLayerCount: number = 0;

	// noinspection JSUnusedLocalSymbols
	private constructor() {
		BodyScrollLock.detectPassiveSupport();
	}

	private static detectPassiveSupport(): void {
		// noinspection JSUnusedGlobalSymbols
		const passiveTestOptions = {
			get passive() {
				BodyScrollLock.hasPassiveEvents = true;
				return undefined;
			}
		};
		// @ts-expect-error ignore the type check
		window.addEventListener('testPassive', null, passiveTestOptions);
		// @ts-expect-error ignore the type check
		window.removeEventListener('testPassive', null, passiveTestOptions);
	}

	private static checkIOSDevice(): boolean {
		// noinspection JSDeprecatedSymbols
		const platform = window.navigator?.platform;
		if (platform == null) {
			return false;
		}
		if (/iP(ad|hone|od)/.test(platform)) {
			return true;
		}
		// noinspection RedundantIfStatementJS
		if (platform === 'MacIntel' && window.navigator.maxTouchPoints > 1) {
			return true;
		} else {
			return false;
		}
	}

	private static preventDefault(rawEvent: HandleScrollEvent): boolean {
		// noinspection JSDeprecatedSymbols
		const e = rawEvent || window.event;

		// Do not prevent if the event has more than one touch (usually meaning this is a multitouch gesture like pinch to zoom).
		if (e.touches.length > 1) {
			return true;
		}

		const el = e?.target as HTMLElement;
		if (!el.hasAttribute('data-hx-portal-root')) {
			const root = el.closest('div[data-hx-portal-root]');
			if (root != null) {
				return true;
			}
		}

		if (e.preventDefault) {
			e.preventDefault();
		}

		return false;
	};

	private static setOverflowToHidden(): void {
		// If previousBodyPaddingRight is already set, don't set it again.
		if (BodyScrollLock.previousBodyPaddingRight === undefined) {
			const reserveScrollBarGap = BodyScrollLock.reserveScrollBarGap;
			const scrollBarGap = window.innerWidth - document.documentElement.clientWidth;

			if (reserveScrollBarGap && scrollBarGap > 0) {
				const computedBodyPaddingRight = parseInt(window.getComputedStyle(document.body).getPropertyValue('padding-right'), 10);
				BodyScrollLock.previousBodyPaddingRight = document.body.style.paddingRight;
				document.body.style.paddingRight = `${computedBodyPaddingRight + scrollBarGap}px`;
			}
		}

		// If previousBodyOverflowSetting is already set, don't set it again.
		if (BodyScrollLock.previousBodyOverflow === undefined) {
			BodyScrollLock.previousBodyOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
		}
	};

	private static restoreOverflow(): void {
		if (BodyScrollLock.previousBodyPaddingRight !== undefined) {
			document.body.style.paddingRight = BodyScrollLock.previousBodyPaddingRight;

			// Restore previousBodyPaddingRight to undefined so setOverflowHidden knows it
			// can be set again.
			BodyScrollLock.previousBodyPaddingRight = undefined;
		}

		if (BodyScrollLock.previousBodyOverflow !== undefined) {
			document.body.style.overflow = BodyScrollLock.previousBodyOverflow;

			// Restore previousBodyOverflowSetting to undefined
			// so setOverflowHidden knows it can be set again.
			BodyScrollLock.previousBodyOverflow = undefined;
		}
	};

	private static setPositionToFixed(): void {
		window.requestAnimationFrame(() => {
			// If previousBodyPosition is already set, don't set it again.
			if (BodyScrollLock.previousBodyPosition === undefined) {
				BodyScrollLock.previousBodyPosition = {
					position: document.body.style.position,
					top: document.body.style.top,
					left: document.body.style.left
				};

				// Update the dom inside an animation frame
				const {scrollY, scrollX, innerHeight} = window;
				document.body.style.position = 'fixed';
				document.body.style.top = `${-scrollY}px`;
				document.body.style.left = `${-scrollX}px`;

				setTimeout(() => window.requestAnimationFrame(() => {
					// Attempt to check if the bottom bar appeared due to the position change
					const bottomBarHeight = innerHeight - window.innerHeight;
					if (bottomBarHeight && scrollY >= innerHeight) {
						// Move the content further up so that the bottom bar doesn't hide it
						document.body.style.top = `${-(scrollY + bottomBarHeight)}px`;
					}
				}), 300);
			}
		});
	};

	private static restorePosition(): void {
		if (BodyScrollLock.previousBodyPosition !== undefined) {
			// Convert the position from "px" to Int
			const y = -parseInt(document.body.style.top, 10);
			const x = -parseInt(document.body.style.left, 10);

			// Restore styles
			document.body.style.position = BodyScrollLock.previousBodyPosition.position;
			document.body.style.top = BodyScrollLock.previousBodyPosition.top;
			document.body.style.left = BodyScrollLock.previousBodyPosition.left;

			// Restore scroll
			window.scrollTo(x, y);

			BodyScrollLock.previousBodyPosition = undefined;
		}
	};

	static lock(): void {
		// change count of popup layers
		BodyScrollLock.popupLayerCount += 1;

		if (BodyScrollLock.popupLayerCount === 1) {
			// avoid body mouse events
			if (!document.body.hasAttribute('data-hx-origin-pointer-events')) {
				document.body.setAttribute('data-hx-origin-pointer-events', document.body.style.pointerEvents || 'unset');
			}
			document.body.style.pointerEvents = 'none';

			if (BodyScrollLock.isIosDevice) {
				BodyScrollLock.setPositionToFixed();
				document.addEventListener('touchmove', BodyScrollLock.preventDefault, BodyScrollLock.hasPassiveEvents ? {passive: false} : undefined);
			} else {
				BodyScrollLock.setOverflowToHidden();
			}
		}
	}

	static unlock(): void {
		// change count of popup layers
		BodyScrollLock.popupLayerCount -= 1;

		if (BodyScrollLock.popupLayerCount === 0) {
			// recover body mouse events avoiding
			const originValue = document.body.getAttribute('data-hx-origin-pointer-events');
			document.body.removeAttribute('data-hx-origin-pointer-events');
			if (originValue === 'unset') {
				document.body.style.pointerEvents = '';
			} else {
				document.body.style.pointerEvents = originValue ?? '';
			}

			if (BodyScrollLock.isIosDevice) {
				// @ts-expect-error ignore the options field check
				document.removeEventListener('touchmove', BodyScrollLock.preventDefault, hasPassiveEvents ? {passive: false} : undefined);
				BodyScrollLock.restorePosition();
			} else {
				BodyScrollLock.restoreOverflow();
			}
		}
	}
}
