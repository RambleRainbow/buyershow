module.exports = {
  // 基础配置
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  
  // JSX配置
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // 其他配置
  arrowParens: 'avoid',
  endOfLine: 'lf',
  bracketSpacing: true,
  quoteProps: 'as-needed',
  
  // 文件特定覆盖
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.{yml,yaml}',
      options: {
        singleQuote: false,
      },
    },
  ],
};