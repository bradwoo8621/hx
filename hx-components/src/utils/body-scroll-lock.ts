import {DeviceCheck} from './browser';

/**
 * Touch event type alias for scroll handling
 */
type HandleScrollEvent = TouchEvent;

/**
 * Stores original body position styles before locking
 */
interface BodyPosition {
	position: CSSStyleDeclaration['position'],
	top: CSSStyleDeclaration['top'],
	left: CSSStyleDeclaration['left']
}

/**
 * Cross-platform body scroll lock implementation for modal dialogs and popups
 * Prevents background scrolling when overlay components are displayed
 *
 * Based on the popular body-scroll-lock library: https://github.com/willmcpo/body-scroll-lock
 * Adapted for HX component library with multi-layer popup support
 */
export class BodyScrollLock {
	/** Whether browser supports passive event listeners (for performance) */
	private static hasPassiveEvents: boolean = false;
	/** Flag indicating if current device is iOS (including iPadOS on Mac) */
	private static readonly isIosDevice = DeviceCheck.checkIOSDevice();

	/** Whether to reserve space for scrollbar when locking to prevent layout shift */
	public static reserveScrollBarGap: boolean = false;

	/** Original body overflow style before locking */
	private static previousBodyOverflow: CSSStyleDeclaration['overflow'] | undefined;
	/** Original body padding-right style before locking (for scrollbar gap compensation) */
	private static previousBodyPaddingRight: CSSStyleDeclaration['paddingRight'] | undefined;
	/** Original body position styles before locking (for iOS devices) */
	private static previousBodyPosition: BodyPosition | undefined;

	/** Counter for active popup layers to handle nested popups correctly */
	private static popupLayerCount: number = 0;

	static {
		BodyScrollLock.detectPassiveSupport();
	}

	/**
	 * Private constructor to prevent instantiation (static utility class)
	 */
	// noinspection JSUnusedLocalSymbols
	private constructor() {
	}

	/**
	 * Detect if browser supports passive event listeners for better scroll performance
	 * Uses a feature test to check for passive option support
	 */
	private static detectPassiveSupport(): void {
		// noinspection JSUnusedGlobalSymbols
		const passiveTestOptions = {
			get passive() {
				BodyScrollLock.hasPassiveEvents = true;
				return (void 0);
			}
		};
		// @ts-expect-error ignore type check for test event listener
		window.addEventListener('testPassive', null, passiveTestOptions);
		// @ts-expect-error ignore type check for test event listener
		window.removeEventListener('testPassive', null, passiveTestOptions);
	}

	/**
	 * Prevent default touchmove behavior for body scroll
	 * Allows scrolling inside portal root elements (popups/modals) while blocking background scroll
	 * @param rawEvent - Touch event to handle
	 */
	private static preventDefault(rawEvent: HandleScrollEvent): boolean {
		// noinspection JSDeprecatedSymbols
		const e = rawEvent || window.event;

		// Allow multitouch gestures (pinch to zoom, etc.)
		if (e.touches.length > 1) {
			return true;
		}

		// Allow scrolling inside portal root elements (popups/modals)
		const el = e?.target as HTMLElement;
		if (!el.hasAttribute('data-hx-portal-root')) {
			const root = el.closest('div[data-hx-portal-root]');
			if (root != null) {
				return true;
			}
		}

		// Prevent background scroll
		if (e.preventDefault) {
			e.preventDefault();
		}

		return false;
	}

	/**
	 * Set body overflow to hidden for non-iOS devices to prevent scrolling
	 * Optionally reserves scrollbar gap to avoid layout shift when scrollbar disappears
	 */
	private static setOverflowToHidden(): void {
		// Only set padding once even with multiple locks
		if (BodyScrollLock.previousBodyPaddingRight == null) {
			const reserveScrollBarGap = BodyScrollLock.reserveScrollBarGap;
			const scrollBarGap = window.innerWidth - document.documentElement.clientWidth;

			// Compensate for scrollbar width to prevent layout shift
			if (reserveScrollBarGap && scrollBarGap > 0) {
				const computedBodyPaddingRight = parseInt(window.getComputedStyle(document.body).getPropertyValue('padding-right'), 10);
				BodyScrollLock.previousBodyPaddingRight = document.body.style.paddingRight;
				document.body.style.paddingRight = `${computedBodyPaddingRight + scrollBarGap}px`;
			}
		}

		// Only set overflow once even with multiple locks
		if (BodyScrollLock.previousBodyOverflow == null) {
			BodyScrollLock.previousBodyOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
		}
	}

	/**
	 * Restore original body overflow and padding styles after unlock
	 */
	private static restoreOverflow(): void {
		// Restore original padding right
		if (BodyScrollLock.previousBodyPaddingRight != null) {
			document.body.style.paddingRight = BodyScrollLock.previousBodyPaddingRight;
			BodyScrollLock.previousBodyPaddingRight = (void 0);
		}

		// Restore original overflow
		if (BodyScrollLock.previousBodyOverflow != null) {
			document.body.style.overflow = BodyScrollLock.previousBodyOverflow;
			BodyScrollLock.previousBodyOverflow = (void 0);
		}
	}

	/**
	 * Set body position to fixed for iOS devices to prevent scrolling
	 * Preserves current scroll position and handles mobile browser bottom bar adjustment
	 */
	private static setPositionToFixed(): void {
		window.requestAnimationFrame(() => {
			// Only set position once even with multiple locks
			if (BodyScrollLock.previousBodyPosition == null) {
				// Save original position styles
				BodyScrollLock.previousBodyPosition = {
					position: document.body.style.position,
					top: document.body.style.top,
					left: document.body.style.left
				};

				// Save current scroll position and set fixed positioning
				const {scrollY, scrollX, innerHeight} = window;
				document.body.style.position = 'fixed';
				document.body.style.top = `${-scrollY}px`;
				document.body.style.left = `${-scrollX}px`;

				// Adjust for mobile browser bottom bar that appears after position change
				setTimeout(() => window.requestAnimationFrame(() => {
					const bottomBarHeight = innerHeight - window.innerHeight;
					if (bottomBarHeight && scrollY >= innerHeight) {
						document.body.style.top = `${-(scrollY + bottomBarHeight)}px`;
					}
				}), 300);
			}
		});
	}

	/**
	 * Restore original body position and scroll position for iOS devices after unlock
	 */
	private static restorePosition(): void {
		if (BodyScrollLock.previousBodyPosition != null) {
			// Extract saved scroll position from fixed positioning styles
			const y = -parseInt(document.body.style.top, 10);
			const x = -parseInt(document.body.style.left, 10);

			// Restore original position styles
			document.body.style.position = BodyScrollLock.previousBodyPosition.position;
			document.body.style.top = BodyScrollLock.previousBodyPosition.top;
			document.body.style.left = BodyScrollLock.previousBodyPosition.left;

			// Restore original scroll position
			window.scrollTo(x, y);

			BodyScrollLock.previousBodyPosition = (void 0);
		}
	}

	/**
	 * Lock body scrolling
	 * Handles nested popups correctly by counting active layers - only locks once when first popup opens
	 * Disables body pointer events to prevent interaction with background content
	 */
	static lock(): void {
		BodyScrollLock.popupLayerCount += 1;

		// Only perform lock operations when first popup layer is opened
		if (BodyScrollLock.popupLayerCount === 1) {
			// Save original pointer events style and disable body interaction
			if (!document.body.hasAttribute('data-hx-origin-pointer-events')) {
				document.body.setAttribute('data-hx-origin-pointer-events', document.body.style.pointerEvents || 'unset');
			}
			document.body.style.pointerEvents = 'none';

			// Use platform-specific locking strategy
			if (BodyScrollLock.isIosDevice) {
				BodyScrollLock.setPositionToFixed();
				document.addEventListener('touchmove', BodyScrollLock.preventDefault, BodyScrollLock.hasPassiveEvents ? {passive: false} : undefined);
			} else {
				BodyScrollLock.setOverflowToHidden();
			}
		}
	}

	/**
	 * Unlock body scrolling
	 * Handles nested popups correctly by counting active layers - only unlocks when last popup closes
	 * Restores original body styles and pointer events
	 */
	static unlock(): void {
		BodyScrollLock.popupLayerCount -= 1;

		// Only perform unlock operations when last popup layer is closed
		if (BodyScrollLock.popupLayerCount === 0) {
			// Restore original pointer events style
			const originValue = document.body.getAttribute('data-hx-origin-pointer-events');
			document.body.removeAttribute('data-hx-origin-pointer-events');
			if (originValue === 'unset') {
				document.body.style.pointerEvents = '';
			} else {
				document.body.style.pointerEvents = originValue ?? '';
			}

			// Use platform-specific unlocking strategy
			if (BodyScrollLock.isIosDevice) {
				// @ts-expect-error ignore type check for event listener options
				document.removeEventListener('touchmove', BodyScrollLock.preventDefault, BodyScrollLock.hasPassiveEvents ? {passive: false} : undefined);
				BodyScrollLock.restorePosition();
			} else {
				BodyScrollLock.restoreOverflow();
			}
		}
	}
}
