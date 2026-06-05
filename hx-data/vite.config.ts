import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [
		dts({
			tsconfigPath: './tsconfig.json',
			entryRoot: 'src',
			outDir: 'dist/types'
		})
	],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'hx',
			fileName: (format) => `hx.${format}.js`
		},
		rolldownOptions: {
			// external: [],
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
					entryFileNames: 'hx-data.esm.js'
				}
			]
		},
		minify: false
	}
});