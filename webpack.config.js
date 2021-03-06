/* eslint-disable import/no-commonjs */

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const PORT = 3000;

const babelrc = JSON.parse(
  fs.readFileSync(path.join(__dirname, '.babelrc'), 'utf-8').toString()
);

const entry = [ './src/index.js' ];

module.exports = (env = { NODE_ENV: 'development' }) => ({
  devtool: 'source-map',
  entry: env.NODE_ENV === 'production'
    ? entry
    : [
      `webpack-dev-server/client?http://localhost:${PORT}`,
      'webpack/hot/only-dev-server',
      ...entry,
    ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(env.NODE_ENV) },
    }),
    new ExtractTextPlugin({ filename: 'styles.css', allChunks: true }),
  ].concat(
    env.NODE_ENV === 'production'
      ? [
        new webpack.LoaderOptionsPlugin({ minimize: true, debug: false }),
        new webpack.optimize.UglifyJsPlugin({
          compress: { warnings: false },
          sourceMap: true,
        }),
      ]
      : [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
      ]
  ),
  module: {
    rules: [
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          publicPath: '/dist',
          fallbackLoader: 'style-loader',
          loader: [ 'css-loader', 'postcss-loader', 'sass-loader?sourceMap' ],
        }),
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: (
          env.NODE_ENV !== 'production'
            ? [ { loader: 'react-hot-loader' } ]
            : []
          ).concat([
            {
              loader: 'babel-loader',
              options: Object.assign({}, babelrc, {
                presets: babelrc.presets.map(
                  p => p === 'es2015' ? [ 'es2015', { modules: false } ] : p
                ),
              }),
            },
          ]),
      },
      {
        test: /\.(bmp|gif|jpg|jpeg|png|svg|webp|ttf|otf)$/,
        use: { loader: 'url-loader', options: { limit: 25000 } },
      },
    ],
  },
  devServer: {
    contentBase: 'static/',
    hot: true,
    port: PORT,
  },
});


