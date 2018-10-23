const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Require  html-webpack-plugin plugin
const DashboardPlugin = require('webpack-dashboard/plugin');

const config = {
  entry: path.join(__dirname, '/playground/test.js'), // webpack entry point. Module to start building dependency graph
  mode: 'development',
  devtool: 'eval-source-map', // Set the devtool
  output: {
    path: path.join(__dirname, '/build'), // Folder to store generated bundle
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
    new DashboardPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '/playground/public/index.html'),
      inject: 'body',
    }),
  ],
  devServer: { // configuration for webpack-dev-server
    contentBase: './playground/public', // source of static assets
    port: 7700, // port to run dev-server
  },
};

module.exports = config;
