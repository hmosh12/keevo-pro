import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';
import globals from 'globals';

export default [
  firebaseRulesPlugin.configs['flat/recommended'],
  {
    files: ['**/*.rules'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
