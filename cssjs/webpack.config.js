const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const WebpackOptionalPlugin = require('webpack-optional-plugin');


module.exports = function (env) {
  return {
    plugins: [
      // new CleanWebpackPlugin(['dist']),
      new MiniCssExtractPlugin({
        filename: 'support-console-plus-' + env.region + '.min.css'
      }),
    ],
    entry: './src/global/main.js',
    output: {
      filename: 'support-console-plus-' + env.region + '.min.js',
      path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
      plugins: [
        new WebpackOptionalPlugin({
          enabled: env.region === 'latam',
          include: [
            path.resolve(__dirname, 'src', 'latam')
          ]
        }),
        new WebpackOptionalPlugin({
          enabled: env.region === 'apac',
          include: [
            path.resolve(__dirname, 'src', 'apac')
          ]
        }),
        new WebpackOptionalPlugin({
          enabled: env.region === 'na',
          include: [
            path.resolve(__dirname, 'src', 'na')
          ]
        }),
        new WebpackOptionalPlugin({
          enabled: env.region === 'emea',
          include: [
            path.resolve(__dirname, 'src', 'emea')
          ]
        }),
      ]
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }, {
        test: /\.css$/,
        use: [{
            loader: MiniCssExtractPlugin.loader,
          },
          // 'style-loader',
          'css-loader',
        ]
      }]
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          cache: true,
          sourceMap: true,
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    mode: 'production'
  }
};