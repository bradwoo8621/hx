import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [
		react(),
		dts({
			insertTypesEntry: true,
			include: ['./src/components/**/*.ts'],
			rollupTypes: true
		})
	],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'hx',
			formats: ['es', 'umd'],
			fileName: (format) => `hx.${format}.js`
		},
		rollupOptions: {
			external: ['react', 'react-dom'],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM'
				}
			}
		}
	}
});