/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  endOfLine: 'auto',
}

export default config
