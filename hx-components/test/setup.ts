import {Window} from 'happy-dom';

const window = new Window();

// noinspection JSConstantReassignment
global.window = {
	...global.window,
	location: window.location,
	localStorage: window.localStorage,
	matchMedia: window.matchMedia,
	addEventListener: window.addEventListener,
	removeEventListener: window.removeEventListener,
	dispatchEvent: window.dispatchEvent
} as any;