import {readFileSync, writeFileSync} from 'fs';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import {defineConfig, lazyPlugins} from 'vite-plus';
import {tsgoPlugin} from '../scripts/tsgo-plugin';

export default defineConfig({
	plugins: lazyPlugins(() => [
		react({
			jsxRuntime: 'classic'
		}),
		tsgoPlugin({
			projectRoot: __dirname,
			post() {
				const dts = resolve(__dirname, 'dist/esm/index.d.ts');
				const content = readFileSync(dts, 'utf8')
					.replace(/^import\s+['"]\.\/styles\/index\.css['"];\s*\n?/gm, '');
				writeFileSync(dts, content);
			}
		})
	]),
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'hx',
			fileName: (format) => `hx.${format}.js`,
			cssFileName: 'hx-components'
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