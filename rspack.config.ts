import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import path from 'path';

export default defineConfig({
  entry: {
    index: './src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      type: 'commonjs2',
    },
    clean: true,
  },
  target: 'node',
  externalsType: 'commonjs',
  externals: [
    // Externalize all dependencies to avoid bundling them
    /^storyblok-js-client/,
    /^@storyblok\/richtext/,
    /^fs$/,
    /^path$/,
    /^node:.*/,
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                },
                target: 'es2022',
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }),
  ],
  optimization: {
    minimize: false, // Don't minify for libraries
  },
  devtool: false,
  experiments: {
    css: false,
  },
});
