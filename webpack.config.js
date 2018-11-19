const path = require('path');

const TerserPlugin = require('terser-webpack-plugin');

const inputPath = '/Users/thien/Code/anduin/design/core/' +
  'target/scala-2.12/scalajs-bundler/main'

module.exports = {
  entry: `${inputPath}/modules/anduin.guide.app.main.js`,
  output: {
    // filename: '[name].[chunkhash:6].js',
    // chunkFilename: '[name].[chunkhash:6].js',
    filename: 'main.js',
    path: path.resolve(__dirname, '../test')
  },
  mode: 'development',
  optimization: {
    minimizer: [new TerserPlugin({
    })]
  }
};
