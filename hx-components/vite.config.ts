import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [
		react({
			jsxRuntime: 'classic'
		}),
		// dts({
		// 	insertTypesEntry: true,
		// 	include: ['./src/**/*.ts?'],
		// 	rollupTypes: true
		// })
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
			formats: ['es'],
			fileName: (format) => `hx.${format}.js`
		},
		rolldownOptions: {
			external: ['react', 'react-dom'],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM'
				},
				preserveModules: true,
				preserveModulesRoot: 'src',
				entryFileNames: ({name}) => {
					if (name === 'index') {
						return '[format]/index.js';
					}
					return '[format]/[name].js';
				},
				exports: 'named'
			}
		},
		minify: false,
		cssMinify: false,
	}
});