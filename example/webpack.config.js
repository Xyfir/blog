const webpack = require('webpack');
const path = require('path');

// const MODE = 'development';
const MODE = 'production';

module.exports = {
  mode: MODE,

  entry: './src/Example.jsx',

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },

  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    alias: {
      repo: path.resolve(__dirname, '../')
    },
    extensions: ['.js', '.jsx']
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: [__dirname],
        exclude: /node_modules/,
        options: {
          presets: ['env', 'react']
        }
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(MODE)
      }
    })
  ]
};
