module.exports = {
  extends: ['./packages/lint/stylelint'],
  ignoreFiles: [
    "**/*.css",
    "./packages/**/dist/*.css",
    "./packages/**/dist/**/*.css",
    "./packages/**/dist/**/*.less",
  ]
};
