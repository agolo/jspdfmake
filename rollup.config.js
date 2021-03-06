// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import json from 'rollup-plugin-json';

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === 'production';

export default {
  entry: isProd ? 'src/index.js' : 'playground/main.js',
  dest: isProd ? 'dist/jspdfmake.min.js' : 'playground/public/build/bundle.js',
  moduleName: 'JsPDFMake',
  format: 'cjs',
  sourceMap: 'inline',
  plugins: [
    resolve({
      mainFields: ['jsnext', 'main', 'browser'], // Default: ['module', 'main']
    }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        // left-hand side can be an absolute path, a path
        // relative to the current directory, or the name
        // of a module in node_modules
        'node_modules/jspdfmake': ['JsPDFMake']
      }
    }),
    json(),
    eslint({
      exclude: ['node_modules/**', 'playground/**']
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    replace({
      exclude: 'node_modules/**',
      ENV: JSON.stringify(NODE_ENV)
    }),
    isProd && uglify()
    // indicate which modules should be treated as external
  ],
  external: isProd && ['jspdf'],
  globals: isProd && {
    jspdf: 'jsPDF'
  }
};
