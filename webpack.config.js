const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Require  html-webpack-plugin plugin
const DashboardPlugin = require('webpack-dashboard/plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const ENV = process.env.APP_ENV;
const isTest = ENV === 'test';
const isProd = ENV === 'production';

// function to set dev-tool depending on environment
function setDevTool() {
  if (isTest) {
    return 'inline-source-map';
  }
  if (isProd) {
    return 'source-map';
  }
  return 'eval-source-map';
}

function setEntryPoint() {
  if (isProd) {
    return path.join(__dirname, '/src/index.js');
  }
  return path.join(__dirname, '/playground/test.js');
}

const config = {
  entry: setEntryPoint(), // webpack entry point. Module to start building dependency graph
  mode: ENV,
  output: {
    path: path.join(__dirname, '/dist'), // Folder to store generated bundle
    filename: 'jspdf.min.js', // Name of generated bundle after build
    publicPath: '/', // public URL of the output directory when referenced in a browser
  },
  devtool: setDevTool(), // Set the devtool
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
  ],
  devServer: { // configuration for webpack-dev-server
    contentBase: './playground/public', // source of static assets
    port: 7700, // port to run dev-server
  },
};

// Minify and copy assets in production
if (isProd) {
  // plugins to use in a production environment
  config.plugins.push(
    new UglifyJSPlugin(), // minify the chunk
  );
} else {
  // plugins to use in a development/test environment
  config.plugins.push(
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '/playground/public/index.html'),
      inject: 'body',
    }),
  );
}

module.exports = config;
