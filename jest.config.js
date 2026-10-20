const expoPreset = require('jest-expo/jest-preset');

// htmlparser2 and its dom* / entities dependencies ship ES modules only.
const esmPackages = ['htmlparser2', 'domhandler', 'domutils', 'dom-serializer', 'domelementtype', 'entities'];

module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.html$': '<rootDir>/tools/jest-html-transformer.js',
  },
  transformIgnorePatterns: expoPreset.transformIgnorePatterns.map((pattern) =>
    pattern.startsWith('/node_modules/(?!(') ? pattern.replace('(?!(', `(?!(${esmPackages.join('|')}|`) : pattern,
  ),
  testPathIgnorePatterns: ['/node_modules/', '/__fixtures__/'],
};
