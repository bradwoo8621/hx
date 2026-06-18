import {spawnSync} from 'node:child_process';
import {resolve} from 'path';
import type {Plugin} from 'vite-plus';

export interface TsgoPluginOptions {
	projectRoot: string;
	post?: () => void;
}

export const tsgoPlugin = (options: TsgoPluginOptions): Plugin => {
	return {
		name: 'hx-tsgo-dts',
		closeBundle() {
			const start = process.hrtime();
			const r = spawnSync('node', [
				resolve(options.projectRoot, 'node_modules/@typescript/native-preview/bin/tsgo.js'),
				'-p', 'tsconfig.json',
				'--declaration', '--emitDeclarationOnly',
				'--noEmit', 'false',
				'--rootDir', 'src',
				'--outDir', 'dist/esm'
			], {
				cwd: options.projectRoot,
				encoding: 'utf8'
			});
			const diff = process.hrtime(start);
			const ms = Math.round(diff[0] * 1000 + diff[1] / 1e6);
			if (r.status !== 0) {
				if (r.stderr.length) {
					process.stderr.write(r.stderr);
				}
				if (r.stdout.length) {
					process.stdout.write(r.stdout);
				}
				console.log(`\x1B[31m✗ dts failed in ${ms}ms`);
				this.error(`tsgo exited with code ${r.status}`);
			} else {
				options.post?.();
				console.log(`\x1B[32m✓ dts built in ${ms}ms`);
			}
		}
	};
};