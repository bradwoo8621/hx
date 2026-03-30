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
 * Cross-platform body scroll lock implementation for overlays
 * Prevents background scrolling when overlay components are displayed
 *
 * Based on the popular body-scroll-lock library: https://github.com/willmcpo/body-scroll-lock
 * Adapted for HX component library with multi-layer overlays support
 */
export class BodyScrollLock {
	/** Whether browser supports passive event listeners (for performance) */
	private static hasPassiveEvents: boolean = false;
	/** Flag indicating if current device is iOS (including iPadOS on Mac) */
	private static readonly isIosDevice = BodyScrollLock.checkIOSDevice();

	/** Whether to reserve space for scrollbar when locking to prevent layout shift */
	public static reserveScrollBarGap: boolean = false;

	/** Original body overflow style before locking */
	private static previousBodyOverflow: CSSStyleDeclaration['overflow'] | undefined;
	/** Original body padding-right style before locking (for scrollbar gap compensation) */
	private static previousBodyPaddingRight: CSSStyleDeclaration['paddingRight'] | undefined;
	/** Original body position styles before locking (for iOS devices) */
	private static previousBodyPosition: BodyPosition | undefined;

	/** Counter for active overlay layers to handle nested overlays correctly */
	private static overlayLayerCount: number = 0;

	/**
	 * Private constructor to prevent instantiation (static utility class)
	 */
	// noinspection JSUnusedLocalSymbols
	private constructor() {
		BodyScrollLock.detectPassiveSupport();
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
				return undefined;
			}
		};
		// @ts-expect-error ignore type check for test event listener
		window.addEventListener('testPassive', null, passiveTestOptions);
		// @ts-expect-error ignore type check for test event listener
		window.removeEventListener('testPassive', null, passiveTestOptions);
	}

	/**
	 * Check if current device is iOS or iPadOS (including iPad running on Mac Intel)
	 * Handles the special case of iPadOS reporting as MacIntel with touch support
	 */
	private static checkIOSDevice(): boolean {
		// noinspection JSDeprecatedSymbols
		const platform = window.navigator?.platform;
		if (platform == null) {
			return false;
		}
		// Match iOS devices
		if (/iP(ad|hone|od)/.test(platform)) {
			return true;
		}
		// Match iPadOS running on Mac (reports as MacIntel with multitouch support)
		return platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
	}

	/**
	 * Prevent default touchmove behavior for body scroll
	 * Allows scrolling inside portal root elements (overlays) while blocking background scroll
	 * @param rawEvent - Touch event to handle
	 */
	private static preventDefault(rawEvent: HandleScrollEvent): boolean {
		// noinspection JSDeprecatedSymbols
		const e = rawEvent || window.event;

		// Allow multitouch gestures (pinch to zoom, etc.)
		if (e.touches.length > 1) {
			return true;
		}

		// Allow scrolling inside portal root elements (overlays)
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
	};

	/**
	 * Set body overflow to hidden for non-iOS devices to prevent scrolling
	 * Optionally reserves scrollbar gap to avoid layout shift when scrollbar disappears
	 */
	private static setOverflowToHidden(): void {
		// Only set padding once even with multiple locks
		if (BodyScrollLock.previousBodyPaddingRight === undefined) {
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
		if (BodyScrollLock.previousBodyOverflow === undefined) {
			BodyScrollLock.previousBodyOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
		}
	};

	/**
	 * Restore original body overflow and padding styles after unlock
	 */
	private static restoreOverflow(): void {
		// Restore original padding right
		if (BodyScrollLock.previousBodyPaddingRight !== undefined) {
			document.body.style.paddingRight = BodyScrollLock.previousBodyPaddingRight;
			BodyScrollLock.previousBodyPaddingRight = undefined;
		}

		// Restore original overflow
		if (BodyScrollLock.previousBodyOverflow !== undefined) {
			document.body.style.overflow = BodyScrollLock.previousBodyOverflow;
			BodyScrollLock.previousBodyOverflow = undefined;
		}
	};

	/**
	 * Set body position to fixed for iOS devices to prevent scrolling
	 * Preserves current scroll position and handles mobile browser bottom bar adjustment
	 */
	private static setPositionToFixed(): void {
		window.requestAnimationFrame(() => {
			// Only set position once even with multiple locks
			if (BodyScrollLock.previousBodyPosition === undefined) {
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
	};

	/**
	 * Restore original body position and scroll position for iOS devices after unlock
	 */
	private static restorePosition(): void {
		if (BodyScrollLock.previousBodyPosition !== undefined) {
			// Extract saved scroll position from fixed positioning styles
			const y = -parseInt(document.body.style.top, 10);
			const x = -parseInt(document.body.style.left, 10);

			// Restore original position styles
			document.body.style.position = BodyScrollLock.previousBodyPosition.position;
			document.body.style.top = BodyScrollLock.previousBodyPosition.top;
			document.body.style.left = BodyScrollLock.previousBodyPosition.left;

			// Restore original scroll position
			window.scrollTo(x, y);

			BodyScrollLock.previousBodyPosition = undefined;
		}
	};

	/**
	 * Lock body scrolling
	 * Handles nested overlays correctly by counting active layers - only locks once when first overlay opens
	 * Disables body pointer events to prevent interaction with background content
	 */
	static lock(): void {
		BodyScrollLock.overlayLayerCount += 1;

		// Only perform lock operations when first overlay layer is opened
		if (BodyScrollLock.overlayLayerCount === 1) {
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
	 * Handles nested overlays correctly by counting active layers - only unlocks when last overlay closes
	 * Restores original body styles and pointer events
	 */
	static unlock(): void {
		BodyScrollLock.overlayLayerCount -= 1;

		// Only perform unlock operations when last overlay layer is closed
		if (BodyScrollLock.overlayLayerCount === 0) {
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
