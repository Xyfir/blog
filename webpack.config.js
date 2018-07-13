const webpack = require('webpack');
const path = require('path');

// const MODE = 'development';
const MODE = 'production';

module.exports = {
  mode: MODE,

  entry: './src/Blog.jsx',

  output: {
    libraryTarget: 'umd',
    globalObject: 'this',
    filename: 'index.js',
    library: 'XyfirBlog',
    path: path.resolve(__dirname, 'dist')
  },

  resolve: {
    alias: {
      repo: path.resolve(__dirname, '../')
    },
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx']
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: [path.resolve(__dirname, 'src')],
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
