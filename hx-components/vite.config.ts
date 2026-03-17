// @ts-ignore
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
			exclude: ['src/stories/**', 'src/**/*.stories.ts'],
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
			external: ['react', 'react-dom', 'dayjs'],
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
		cssMinify: false
	}
});