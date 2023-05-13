module.exports = {
  extends: [
    "@nuxtjs/eslint-config-typescript",
    "plugin:vue/vue3-recommended",
    "prettier",
    "plugin:jsdoc/recommended-typescript-error",
  ],
  plugins: ["import", "jsdoc", "prettier", "vue"],
  rules: {
    "no-console": "off",
    "prettier/prettier": ["error"],
  },
};
