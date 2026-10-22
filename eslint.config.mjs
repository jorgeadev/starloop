import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
	...nextVitals,
	...nextTs,
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "coverage/**", "public/**"]),
	{
		rules: {
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{ prefer: "type-imports", fixStyle: "inline-type-imports" },
			],
			"react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
		},
	},
]);
