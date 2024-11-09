module.exports = {
  extends: ['./packages/lint/eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/naming-convention': ['off']
  }
};
