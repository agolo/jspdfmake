// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === 'production';

export default {
  entry: isProd ? 'src/index.js' : 'playground/main.js',
  dest: isProd ? 'dist/jspdfmake.min.js' : 'playground/public/build/bundle.js',
  moduleName: 'JsPDFMake',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    eslint({
      exclude: [
        'node_modules/**',
      ],
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    replace({
      exclude: 'node_modules/**',
      ENV: JSON.stringify(NODE_ENV),
    }),
    (isProd && uglify()),
    // indicate which modules should be treated as external
  ],
  external: ['jspdf'],
  globals: {
    jspdf: 'jsPDF'
  }
};

