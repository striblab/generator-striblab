/**
 * Webpack config for building project
 * https://webpack.js.org/
 */
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  devtool: 'source-map',
  entry: './app/index.js',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {
        // Note that this works different on Windows, assumingly
        // because of the different path separator.  Beware.
        test: /\.(svelte\.html|svelte)|app.*\.js$/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        }
      },
      {
        test: /\.(svelte\.html|svelte)$/,
        use: {
          loader: 'svelte-loader',
          options: {
            hydratable: true,
            store: true
          }
        }
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
        uglifyOptions: {
          ecma: 5,
          compress: true,
          safari10: true,
          mangle: {
            safari10: true
          }
        }
      })
    ]
  }
};
