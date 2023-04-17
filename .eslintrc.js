module.exports = {
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:vue/vue3-recommended',
    'prettier',
  ],
  plugins: ['import', 'prettier', 'vue'],
  rules: {
    'no-console': 'off',
    'prettier/prettier': ['error'],
  },
}
