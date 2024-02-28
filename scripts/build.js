console.log('--- build.js ---');
// https://blog.csdn.net/weixin_44224921/article/details/124603854

import fs from 'node:fs';
import { execa } from 'execa'; // 开启子进程，使用rollup进行打包

// 1. 获取packages目录下的所有包 (targets: [ 'echarts', 'shared' ])
const targets = fs.readdirSync('packages').filter(f => {
  // 返回目录
  return fs.statSync(`packages/${f}`).isDirectory();
});

// 2. 对所获取的包目录 并行依次打包

/**
 * 打包的构建方式
 * 打包是异步的
 * @param {*} target
 */
async function build(target) {
  await execa(
    /**
     * 参数一: 执行的打包命令
     * 参数二: 执行的打包参数
     *  -c: 表示采用某个配置文件
     *  --environment: 声明采用环境变量
     *  `TARGET:${target}`: 传的具体环境变量, 可以在rollup.config.js文件中通过process.env.TARGET访问到环境变量target
     * 参数三: 子进程打包的信息共享给父进程
     */
    'rollup',
    ['-c', '--environment', `TARGET:${target}`],
    { stdio: 'inherit' },
  );
}
/**
 * 遍历目录 依次打包
 * @param {*} target
 * @param {*} iteratorFn
 */
function runParallel(targets, iteratorFn) {
  const res = [];
  for (const item of targets) {
    // 打包每一个目录包
    const p = iteratorFn(item); // 并行打包
    res.push(p);
  }
  return Promise.all(res);
}

// 调用
const pro = runParallel(targets, build);

pro.catch(err => {
  console.log('--- Promise.all err --->', err);
});
