import {defineConfig} from 'vite-plus';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	test: {
		environment: 'happy-dom',
		globals: true,
		include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
		setupFiles: ['./test/setup.ts'],
	}
});