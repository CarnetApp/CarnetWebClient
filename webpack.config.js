const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry:  {'browsers/browser': './src/browsers/browser.js', 
  'reader/reader': "./src/reader/reader.js"},
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    fallback: {
        "fs": false
    },
},
  plugins: [
    new HtmlWebpackPlugin({
        template: "./src/index.html",
        filename: "index.html",
        minify: false,
        chunks: ["mobileguide"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/reader/reader.html",
      filename: "reader/reader.html",
      minify: false,
      chunks: ["mobileguide"],
  }),
    new NodePolyfillPlugin(),
    new CopyPlugin({
      patterns: [
        { from: "src/css", to: "css" },
      ],
    }),
    new CopyPlugin({
      patterns: [
        { from: "fonts", to: "fonts" },
      ],
    }),
    new CopyPlugin({
      patterns: [
        { from: "img", to: "img" },
      ],
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/libs", to: "libs" },
      ],
    }),
    new CopyPlugin({
      patterns: [
        { from: "i18n", to: "i18n" },
      ],
    }),
    
  ],
  optimization: {
    minimize: false
},
};
