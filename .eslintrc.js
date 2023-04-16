module.exports = {
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:vue/vue3-recommended',
    'standard',
    'prettier',
  ],
  plugins: ['import', 'prettier', 'vue'],
  rules: {
    'no-console': 'off',
    // 'no-undef': 'off', // Disabled because of autoimports.
    'prettier/prettier': ['error'],
  },
}
