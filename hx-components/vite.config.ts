import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [
		react({
			jsxRuntime: 'classic'
		}),
		dts({
			tsconfigPath: './tsconfig.json',
			entryRoot: 'src',
			exclude: ['stories/**'],
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
					entryFileNames: ({name}) => {
						if (name === 'index') {
							return '[format]/index.js';
						}
						return '[format]/[name].js';
					},
					exports: 'named'
				}, {
					format: 'es',
					preserveModules: false,
					minify: true,
					entryFileNames: 'hx.esm.js'
				}
			]
		},
		minify: false,
		cssMinify: true,
		sourcemap: true,
	}
});