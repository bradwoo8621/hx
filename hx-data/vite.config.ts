import {resolve} from 'path';
import {defineConfig, lazyPlugins} from 'vite-plus';
import {tsgoPlugin} from '../scripts/tsgo-plugin';
import {viteConfig} from '../scripts/vite.config.default';

export default defineConfig({
	plugins: lazyPlugins(() => [
		tsgoPlugin({projectRoot: __dirname})
	]),
	fmt: viteConfig.fmt,
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
				},
				{
					format: 'es',
					preserveModules: false,
					entryFileNames: 'hx-data.esm.js'
				}
			]
		},
		minify: false
	}
});