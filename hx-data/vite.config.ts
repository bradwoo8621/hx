import {resolve} from 'path';
import {dts} from 'rolldown-plugin-dts';
import {defineConfig, lazyPlugins} from 'vite-plus';

export default defineConfig({
	oxc: {
		exclude: [/\.d\.[cm]?ts$/, /test\//]
	},
	plugins: lazyPlugins(() => [
		dts({
			tsconfig: 'tsconfig.json',
			oxc: true
		})
	]),
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