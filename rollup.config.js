import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import json from '@rollup/plugin-json';
import esbuild from 'rollup-plugin-esbuild';
import { nodeResolve } from '@rollup/plugin-node-resolve';

if (!process.env.TARGET) {
  // process.env.TARGET: shared ... 等 的 文件夹名 ...
  throw new Error('TARGET package must be specified via --environment flag.');
}

const require = createRequire(import.meta.url);
// 当前模块所在目录(绝对路径)
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const packagesDir = path.resolve(__dirname, 'packages'); // /packages的绝对路径
const packageDir = path.resolve(packagesDir, process.env.TARGET); // /packages/xxx 包的绝对路径

// 针对某个模块 拼接路径
const resolve = (/** @type {string} */ p) => path.resolve(packageDir, p);
// 当前被打包的package.json
const pkg = require(resolve('package.json'));
// package.json 的 自定义选项buildOptions
const packageOptions = pkg.buildOptions || {};
// 文件名
const name = packageOptions.filename || path.basename(packageDir);

/**
 * 自定义配置
 * 对打包类型 做映射表 根据提供的formats 格式化需要打包的内容
 * @type {Record<PackageFormat, OutputOptions>}
 */
const outputConfigs = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'es',
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs',
    exports: 'named',
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife', // 立即执行函数
  },
};

const defaultFormats = ['esm-bundler', 'cjs'];
const packageFormats = packageOptions.formats || defaultFormats;

// 打包
function createConfig(format, output) {
  const entryFile = 'src/index.ts'; // 入口文件
  output.sourcemap = !!process.env.SOURCE_MAP;
  const external = packageOptions.external || [];

  // 生成rollup配置
  return {
    input: resolve(entryFile),
    output: {
      ...output,
      name: packageOptions.name,
      globals: {
        vue: 'vue',
        'vue-demi': 'vueDemi',
        echarts: 'echarts',
        'echarts/core': 'echarts/core',
        'echarts/renderers': 'echarts/renderers',
        'echarts/charts': 'echarts/charts',
        'echarts/components': 'echarts/components',
        'resize-detector': 'resizeDetector',
        'lodash-es': 'lodash-es',
      },
    },
    // external: ['vue', 'vue-demi'],
    external,
    plugins: [
      json(),
      // 先解析ts
      esbuild({
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
        sourcemap: output.sourcemap,
      }),
      // 再解析第三方模块
      nodeResolve(),
    ],
  };
}

const packageConfigs = packageFormats.map(format => {
  return createConfig(format, outputConfigs[format]);
});

export default packageConfigs;
