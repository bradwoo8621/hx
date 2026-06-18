import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import {defineConfig, lazyPlugins} from 'vite-plus';

export default defineConfig({
	plugins: lazyPlugins(() => [
		react({
			jsxRuntime: 'classic'
		})
	]),
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'hx',
			fileName: (format) => `hx.${format}.js`,
			cssFileName: 'styles'
		},
		rolldownOptions: {
			external: [
				'react', 'react-dom',
				'dayjs', 'nanoid',
				'@hx/data'
			],
			output: [
				{
					format: 'es',
					preserveModules: true,
					preserveModulesRoot: 'src',
					entryFileNames: () => '[format]/[name].js',
					exports: 'named'
				}
			]
		},
		minify: false,
		cssMinify: true,
		sourcemap: true
	}
});