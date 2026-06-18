import {defineConfig} from 'vite-plus';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	test: {
		environment: 'happy-dom',
		globals: true,
		include: ['**/*.test.ts', '**/*.spec.ts'],
		setupFiles: ['./test/setup.ts'],
	}
});