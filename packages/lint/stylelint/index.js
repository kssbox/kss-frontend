module.exports = {
  customSyntax: 'postcss-less',
  extends: ['stylelint-config-standard', 'stylelint-config-css-modules', 'stylelint-config-rational-order'],
  plugins: ['stylelint-order', 'stylelint-declaration-block-no-ignored-properties'],
  rules: {
    'string-quotes': 'single',
    'font-family-name-quotes': null,
    'no-descending-specificity': null,
    'alpha-value-notation': null,
    'color-function-notation': null,
    'font-family-no-missing-generic-family-keyword': null,
    'plugin/declaration-block-no-ignored-properties': true,
    'selector-class-pattern': '^[a-z][a-z0-9]*((-[a-z0-9]+)*|[a-z0-9]*)$',
    'function-no-unknown': null
  },
  ignoreFiles: ['**/*.ts?(x)']
};
