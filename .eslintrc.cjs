module.exports = {
  extends: [
    "@nuxtjs/eslint-config-typescript",
    "plugin:vue/vue3-recommended",
    "prettier",
    "plugin:jsdoc/recommended-typescript-error",
  ],
  plugins: ["import", "jsdoc", "prettier", "vue"],
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
    "prettier/prettier": ["error"],
    "vue/multi-word-component-names": "off",
  },
};
