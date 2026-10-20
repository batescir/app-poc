const path = require('path');

const upstream = require(
  require.resolve('@expo/metro-config/babel-transformer', {
    paths: [path.dirname(require.resolve('expo/package.json'))],
  }),
);

module.exports.transform = function transform(props) {
  if (props.filename.endsWith('.html')) {
    return upstream.transform({ ...props, src: `module.exports = ${JSON.stringify(props.src)};` });
  }
  return upstream.transform(props);
};
