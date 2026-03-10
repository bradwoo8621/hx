import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import {defineConfig, globalIgnores} from 'eslint/config'
import globals from 'globals'
// noinspection SpellCheckingInspection
import tseslint from 'typescript-eslint'

export default defineConfig([globalIgnores(['dist']), {
	files: ['**/*.{ts,tsx}'],
	extends: [
		js.configs.recommended,
		tseslint.configs.recommended,
		reactHooks.configs.flat.recommended,
		reactRefresh.configs.vite
	],
	languageOptions: {
		ecmaVersion: 2020,
		globals: globals.browser
	}
}, ...storybook.configs["flat/recommended"]])
