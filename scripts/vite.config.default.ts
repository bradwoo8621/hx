import {UserConfig} from 'vite-plus';

export const viteConfig: UserConfig = {
	fmt: {
		useTabs: true,
		tabWidth: 4,
		singleQuote: true,
		semi: true,
		trailingComma: 'all',
		printWidth: 120,
		overrides: [
			{
				files: ['src/**'],
				options: {
					printWidth: 120
				}
			}
		]
	}
};
