module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    "airbnb",
    "airbnb/hooks",
    "plugin:prettier/recommended", // Prettier integration
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "no-console": "warn",
    "react/prop-types": "off",
  },
};
