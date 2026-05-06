import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import type { ConfigWithExtends } from 'typescript-eslint';

const rules = {
  rules: {
    "accessor-pairs": "error",
    "array-callback-return": "warn",
    "block-scoped-var": "error",
    "block-spacing": ["warn", "always"],
    "brace-style": ["warn", "1tbs", { "allowSingleLine": true }],
    "complexity": ["warn", 50],
    "curly": ["warn", "multi-line"],
    "default-case-last": "error",
    "default-param-last": "error",
    "dot-notation": "error",
    "eqeqeq": ["error", "smart"],
    "func-call-spacing": ["warn", "never"],
    "grouped-accessor-pairs": "error",
    "keyword-spacing": "error",
    "linebreak-style": ["error", "unix"],
    "no-await-in-loop": "error",
    "no-caller": "error",
    "no-catch-shadow": "error",
    "no-console": "warn",
    "no-constructor-return": "error",
    "no-div-regex": "error",
    "no-duplicate-imports": "warn",
    "no-eq-null": "error",
    "no-eval": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-extra-label": "error",
    "no-floating-decimal": "error",
    "no-global-assign": "error",
    "no-implied-eval": "error",
    "no-iterator": "error",
    "no-labels": "error",
    "no-label-var": "error",
    "no-lone-blocks": "error",
    "no-loop-func": "error",
    "no-loss-of-precision": "error",
    "no-multi-str": "error",
    "no-new": "error",
    "no-new-func": "error",
    "no-new-wrappers": "error",
    "no-octal": "error",
    "no-octal-escape": "error",
    "no-process-env": "error",
    "no-promise-executor-return": "error",
    "no-proto": "error",
    "no-restricted-properties": "error",
    "no-return-await": "error",
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-shadow": "error",
    "no-shadow-restricted-names": "error",
    "no-template-curly-in-string": "warn",
    "no-throw-literal": "error",
    "no-trailing-spaces": "warn",
    "no-undef": "off",   // TypeScript handles this; ESLint's version doesn't understand TS type globals
    "no-undef-init": "warn",
    "no-unexpected-multiline": "error",
    "no-unneeded-ternary": "error",
    "no-unmodified-loop-condition": "error",
    "no-unreachable": "warn",
    "no-unreachable-loop": "warn",
    "no-unused-expressions": "error",
    "no-unused-vars": "off", // typescript-eslint will check it
    "no-use-before-define": ["off", "nofunc"],
    "no-useless-backreference": "warn",
    "no-useless-call": "warn",
    "no-useless-computed-key": "warn",
    "no-useless-concat": "warn",
    "no-useless-rename": "warn",
    "no-void": "error",
    "no-warning-comments": "warn",
    "no-whitespace-before-property": "warn",
    "no-with": "error",
    "quotes": ["error", "single", { "allowTemplateLiterals": true }],
    "radix": ["error", "always"],
    "require-atomic-updates": "error",
    "require-await": "error",
    "semi": ["error", "always"],
    "semi-spacing": "error",
    "space-unary-ops": "error",
    "wrap-regex": "off",

    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-inferrable-types": ["warn", { "ignoreParameters": true }],
    '@typescript-eslint/no-this-alias': 'warn',
    "@typescript-eslint/no-unused-vars": ["warn", { "vars": "all", "args": "none", "caughtErrors": "none", "destructuredArrayIgnorePattern": "^_" }]
  }
} satisfies ConfigWithExtends;


export default ts.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'docs/**',
      '**/*.d.ts'
    ]
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...ts.configs.stylistic,
  rules,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },
  {
    files: ['**/scripts/*', '**/test/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
        Bun: false
      }
    },
    rules: {
      "no-console": "off",
      "no-await-in-loop": "off"
    }
  }
);
