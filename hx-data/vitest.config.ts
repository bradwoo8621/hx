import { defineConfig } from 'vite-plus';

export default defineConfig({
	test: {
		globals: true,
		include: ['**/*.test.ts', '**/*.spec.ts']
	}
});
