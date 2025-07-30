import prettier from 'eslint-config-prettier';
import vuetify from 'eslint-config-vuetify';

export default [
  ...vuetify({
    rules: {
      'vue/no-deprecated-v-slot-argument': 'error',
      'vue/no-deprecated-slot-attribute': 'error',
      'vue/attributes-order': 'off',
      // Prettier will handle formatting
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-closing-bracket-newline': 'off',
    },
  }),
  prettier,
];
