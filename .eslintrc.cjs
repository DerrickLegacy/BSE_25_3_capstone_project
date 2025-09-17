// module.exports = {
//   env: {
//     browser: true,
//     node: true,
//     es2021: true,
//     jest: true,
//   },
//   extends: [
//     'airbnb',
//     'airbnb/hooks',
//     'plugin:prettier/recommended', // Prettier integration
//   ],
//   parserOptions: {
//     ecmaVersion: 12,
//     sourceType: 'module',
//   },
//   rules: {
//     'no-console': 'warn',
//     'react/prop-types': 'off',
//   },
//   overrides: [
//     {
//       files: ['**/__tests__/**/*.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}'],
//       env: { jest: true, node: true },
//       rules: {
//         'import/no-extraneous-dependencies': [
//           'error',
//           { devDependencies: true },
//         ],
//       },
//     },
//   ],
// };

module.exports = {
  env: {
    browser: true,  // for frontend
    node: true,     // for backend
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb',
    'airbnb/hooks', // React hooks support
    'plugin:prettier/recommended', // Prettier integration
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,  // needed for React files in frontend
    },
  },
  plugins: [
    'react',
    'react-hooks',
  ],
  rules: {
    'no-console': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off', // React 17+
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    // For frontend React files (jsx/js)
    {
      files: ['client/**/*.{js,jsx}'],
      env: {
        browser: true,
      },
      rules: {
        // frontend specific rules can go here if needed
      },
    },
    // For backend files (js only or ts if you use)
    {
      files: ['server/**/*.{js}'],
      env: {
        node: true,
      },
      rules: {
        // backend specific rules if any
      },
    },
    // Jest test files
    {
      files: ['**/__tests__/**/*.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}'],
      env: { jest: true, node: true },
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          { devDependencies: true },
        ],
      },
    },
  ],
};

