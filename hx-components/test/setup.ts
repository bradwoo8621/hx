import {Window} from 'happy-dom';

// happy-dom environment provides a real window/document; only patch browser APIs
// that the environment does not implement (or is missing under other runtimes).
const window = new Window();

if (typeof global.window === 'undefined') {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	global.window = window as any;
} else {
	const target = global.window as unknown as Record<string, unknown>;
	const source = window as unknown as Record<string, unknown>;
	for (const key of ['location', 'localStorage', 'matchMedia', 'addEventListener', 'removeEventListener', 'dispatchEvent']) {
		if (typeof target[key] === 'undefined') {
			target[key] = source[key];
		}
	}
}
