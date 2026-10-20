const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Lets services/homepage/loadHomepage.ts import the saved fixture HTML as a string.
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'html');
config.resolver.sourceExts.push('html');
config.transformer.babelTransformerPath = require.resolve('./tools/metro-html-transformer.js');

module.exports = config;
