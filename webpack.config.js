const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Require  html-webpack-plugin plugin
const DashboardPlugin = require('webpack-dashboard/plugin');

require('dotenv').config();

module.exports = {
  entry: path.join(__dirname, '/src/index.js'), // webpack entry point. Module to start building dependency graph
  mode: 'development',
  output: {
    path: path.join(__dirname, '/dist'), // Folder to store generated bundle
    filename: 'bundle.js', // Name of generated bundle after build
    publicPath: '/', // public URL of the output directory when referenced in a browser
  },
  module: { // where we defined file patterns and their loaders
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: [
          '/node_modules/',
        ],
      },
    ],
  },
  plugins: [ // Array of plugins to apply to build chunk
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '/src/public/index.html'),
      inject: 'body',
    }),
    new webpack.DefinePlugin({
      // plugin to define global constants
    }),
    new DashboardPlugin(),
  ],
  devServer: { // configuration for webpack-dev-server
    contentBase: './src/public', // source of static assets
    port: 7700, // port to run dev-server
  },
};
