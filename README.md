# hf-echarts

vue 封装的 echarts 图表

## 开发

### 依赖安装

```shell
pnpm install
```

### 测试: vue3项目

修改目录

```
cd ./examples/vite-vue3
```

安装依赖

```
pnpm install
```

返回根目录运行项目

```
cd ../../
npm run example:dev:3
```

### 测试: vue2项目

> 说明：
> vue2 为`js`, 不是`ts`。
> 所以，需要打包编译为`js`文件。否则可能回没有生效

打包
```
npm run build
```

修改目录

```
cd ./examples/cli-vue2
```

安装依赖

```
pnpm install
```

返回根目录运行项目

```
cd ../../
npm run example:dev:2
```

## 打包

```
npm run build
```

### buildOptions

`packages/xx/package.json`.buildOptions说明

| 配置项   | 说明                        | 参考值                           |
| -------- | --------------------------- | -------------------------------- |
| name     | 对应rollup配置`output.name` | HfEcharts                        |
| filename | 文件名，默认文件夹名称      | echarts                          |
| formats  | 打包的类型                  | ["cjs", "esm-bundler", "global"] |
| external | 对应rollup配置`external`    | ["vue-demi", "echarts/core"]     |

## 测试

根目录 项目运行：`npm run example:dev:3`
修改文件 根目录 打包编译：`npm run build`
> 添加 watch ？
