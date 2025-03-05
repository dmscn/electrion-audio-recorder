import * as path from 'path';
import type { Configuration } from 'webpack';
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';


import { plugins } from './webpack.plugins';
import { rules } from './webpack.rules';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader'}],
});

export const rendererConfig: Configuration & { devServer?: DevServerConfiguration } = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      'Hooks': path.resolve(__dirname, 'src/hooks'),
      'Components': path.resolve(__dirname, 'src/components'),
    },
  },
  devtool: process.env.NODE_ENV === 'development' ? 'cheap-module-source-map' : 'source-map',
  devServer: {
    headers: {
      "Content-Security-Policy": "default-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src 'self' blob: data:;"
    }
  }
};
