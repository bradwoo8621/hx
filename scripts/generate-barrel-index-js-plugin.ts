import {existsSync, readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import {join} from 'path';
import type {Plugin} from 'vite-plus';

/**
 * Generate barrel index.js files from index.d.ts for directories where
 * rolldown's preserveModules did not produce a runtime index.js.
 *
 * Parses re-export declarations from index.d.ts and emits corresponding
 * index.js, skipping type-only exports.
 */
export const generateBarrelJsPlugin = (distDir: string): Plugin => {
	return {
		name: 'hx-generate-barrel-index-js',
		closeBundle() {
			const start = process.hrtime();
			let count = 0;

			function walk(dir: string, fn: (dir: string) => void): void {
				for (const entry of readdirSync(dir)) {
					const full = join(dir, entry);
					if (statSync(full).isDirectory()) {
						walk(full, fn);
					}
				}
				fn(dir);
			}

			function generate(dir: string): boolean {
				const dts = join(dir, 'index.d.ts');
				if (!existsSync(dts)) {
					return false;
				}
				if (existsSync(join(dir, 'index.js'))) {
					return false;
				}

				const content = readFileSync(dts, 'utf8');
				const lines: Array<string> = [];

				for (const raw of content.split('\n')) {
					const line = raw.trim();
					if (line.length === 0) {
						continue;
					}

					// export * from './xxx';
					const starMatch = line.match(/^export \* from ['"]([^'"]+)['"];?$/);
					if (starMatch) {
						lines.push(`export * from '${starMatch[1]}.js';`);
						continue;
					}

					// export type { ... } → skip
					if (line.startsWith('export type {')) {
						continue;
					}

					// export { type A, B } from './xxx';
					const namedMatch = line.match(/^export \{([^}]*)\} from ['"]([^'"]+)['"];?$/);
					if (namedMatch) {
						const names = namedMatch[1]
							.split(',')
							.map(s => s.trim())
							.filter(s => !s.startsWith('type '));
						if (names.length > 0) {
							lines.push(`export { ${names.join(', ')} } from '${namedMatch[2]}.js';`);
						}
					}
				}

				if (lines.length > 0) {
					writeFileSync(join(dir, 'index.js'), lines.join('\n') + '\n');
					return true;
				}
				return false;
			}

			try {
				walk(distDir, (dir) => {
					if (generate(dir)) {
						count++;
					}
				});
				const diff = process.hrtime(start);
				const ms = Math.round(diff[0] * 1000 + diff[1] / 1e6);
				console.log(`\x1B[32m✓ ${count} barrel indexes generated in ${ms}ms`);
			} catch (e) {
				const diff = process.hrtime(start);
				const ms = Math.round(diff[0] * 1000 + diff[1] / 1e6);
				console.log(`\x1B[31m✗ barrel indexes failed in ${ms}ms`);
				this.error(e as Error);
			}
		}
	};
};
