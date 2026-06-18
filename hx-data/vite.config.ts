import {resolve} from 'path';
import {defineConfig, lazyPlugins} from 'vite-plus';

export default defineConfig({
	plugins: lazyPlugins(() => []),
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'hx',
			fileName: (format) => `hx.${format}.js`
		},
		rolldownOptions: {
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
		minify: false
	}
});