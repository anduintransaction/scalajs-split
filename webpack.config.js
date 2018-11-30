const webpack = require("webpack")
const TerserPlugin = require("terser-webpack-plugin");

const getOutput = (argv) => ({
  path: `${argv["x-path"]}/dist`,
  filename: "./scripts/[name].js",
  chunkFilename: "./scripts/[name].js",
  jsonpScriptType: "module"
})

const terser = new TerserPlugin({
  cache: true,
  parallel: true
})

const getConfig = (env, argv) => ({
  entry: argv["x-entry"],
  output: getOutput(argv),
  mode: "production",
  stats: "errors-only",
  optimization: { minimizer: [ terser ] },
  plugins: [
    new webpack.optimize.MinChunkSizePlugin({
      minChunkSize: 100 * 1024
    })
  ]
})

exports.default = getConfig
