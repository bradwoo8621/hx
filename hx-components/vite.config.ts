import react from '@vitejs/plugin-react';
import {readFileSync, writeFileSync} from 'fs';
import {resolve} from 'path';
import {defineConfig, lazyPlugins} from 'vite-plus';
import {generateBarrelJsPlugin} from '../scripts/generate-barrel-index-js-plugin';
import {tsgoPlugin} from '../scripts/tsgo-plugin';
import {viteConfig} from '../scripts/vite.config.default';

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
		}),
		generateBarrelJsPlugin(resolve(__dirname, 'dist/esm'))
	]),
	fmt: viteConfig.fmt,
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
				// dayjs and its plugin subpaths (e.g. dayjs/plugin/utc) are peer-side
				// dependencies; leave them to the consumer's resolver instead of
				// inlining a private copy into the preserved module tree.
				/^dayjs(\/|$)/, 'nanoid',
				'@hx/data'
			],
			output: [
				{
					format: 'es',
					// preserveModules requires code splitting; Vite's lib default is `false`.
					codeSplitting: true,
					preserveModules: true,
					preserveModulesRoot: 'src',
					entryFileNames: () => '[format]/[name].js',
					exports: 'named'
				},
				{
					format: 'es',
					preserveModules: false,
					entryFileNames: 'hx-components.esm.js'
				}
			]
		},
		minify: true,
		cssMinify: true,
		sourcemap: true
	}
});
