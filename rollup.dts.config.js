import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dts from 'rollup-plugin-dts';

if (!existsSync('temp/packages')) {
  console.warn(
    'no temp dts files found. run `tsc -p tsconfig.build.json` first.',
  );
  process.exit(1);
}

const packages = readdirSync('temp/packages'); // ['echarts', 'shared']
const targets = process.env.TARGETS ? process.env.TARGETS.split(',') : null;
const targetPackages = targets
  ? packages.filter(pkg => targets.includes(pkg))
  : packages;

// 当前模块所在目录(绝对路径)
// const __dirname = fileURLToPath(new URL('.', import.meta.url));
// const packagesDir = path.resolve(__dirname, 'packages'); // /packages的绝对路径
// const resolve = (/** @type {string} */ p) => path.resolve(packagesDir, p);

const packageConfigs = targetPackages.map(
  /** @returns {import('rollup').RollupOptions} */
  pkg => {
    return {
      input: `./temp/packages/${pkg}/src/index.d.ts`,
      output: {
        file: `packages/${pkg}/dist/${pkg}.d.ts`,
        // file: resolve(`${pkg}/dist/${pkg}.d.ts`),
        format: 'es',
      },
      plugins: [dts()],
    };
  },
);

export default packageConfigs;
