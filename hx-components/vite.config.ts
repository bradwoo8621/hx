import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import {dts} from 'rolldown-plugin-dts';
import {defineConfig, lazyPlugins} from 'vite-plus';

export default defineConfig({
	oxc: {
		exclude: [/\.d\.[cm]?ts$/, /stories\//, /test\//]
	},
	plugins: lazyPlugins(() => [
		react({
			jsxRuntime: 'classic'
		}),
		dts({
			tsconfig: 'tsconfig.json',
			compilerOptions: {
				noEmit: false
			}
		})
	]),
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'hx',
			fileName: (format) => `hx.${format}.js`
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
				}, {
					format: 'es',
					preserveModules: false,
					minify: true,
					entryFileNames: 'hx-components.esm.js'
				}
			]
		},
		minify: false,
		cssMinify: true,
		sourcemap: true
	}
});