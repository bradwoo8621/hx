// @ts-ignore
import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
// @ts-ignore
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

// @ts-ignore
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	test: {
		environment: 'happy-dom',
		globals: true,
		include: ['**/*.test.ts', '**/*.spec.ts'],
		setupFiles: ['./test/setup.ts'],
	}
});