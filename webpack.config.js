// webpack 是node写出来的 需要采用node的写法

const path = require('path'); // 将路径转化为绝对路径
console.log(path.resolve(__dirname, 'dist'));

const HtmlWebpackPlugin = require('html-webpack-plugin'); // 生成html文件
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 将css打包到一个文件中通过link标签引入, 不然样式是以style标签的形式直接添加到html中的
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // 压缩css的插件
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin'); // js优化工具，通常和上面的压缩css插件一起使用
const webpack = require('webpack');

module.exports = {
  devServer: {
    port: '8081',
    progress: true,
    contentBase: './build',
    compress: true
  }, // 开发服务器的配置
  mode: 'development', // 模式 默认两种 production development
  entry: './src/index.js', // 入口
  output: {
    filename: 'bundle.js', // 打包后的文件名
    path: path.resolve('build'), // 路径必须是一个绝对路径
  }, // 出口
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // 模版相对路径
      filename: 'index.html', // 生成的文件名
      minify: {
        removeAttributeQuotes: true, // 去除双引号
        collapseWhitespace: true, // 折叠成一行
      }, // 压缩
      hash: true // 脚本文件增加hash值
    }),
    new MiniCssExtractPlugin({
      filename: 'main.css',
    }),
    new webpack.ProvidePlugin({ // 在每个模块中都注入$
      $: 'jquery'
    })
  ], // 数组 放着所有的webpack插件
  module: {
    rules: [
      // loader的特点 功能单一
      // loader的用法 字符串只用于一个loader的情况 如果多个loader的话需要一个数组
      // loader的顺序 默认是从右向左执行 从下向上执行
      // loader还可以写成对象方式 (可以多传一些配置参数)

      // {
      //   test: require.resolve('jquery'),
      //   use: 'expose-loader?$'
      // }, // 将jquery暴露到window中

      // css-loader 解析 @import这种语法的
      // style-loader 它是把css 插入到head的标签中
      {
        test: /\.css$/,
        use: [
          // {
          //   loader: 'style-loader',
          // },
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ]
      },
      {
        test: /\.less$/,
        use: [
          // {
          //   loader: 'style-loader',
          // },
          MiniCssExtractPlugin.loader,
          'css-loader', // @import 解析路径
          'postcss-loader', // 为样式加上兼容前缀
          'less-loader' // less -> css 把less解析成css
        ]
      },
      {
        test: /\.js$/,
        use: { // 用babel-loader es6 -> es5
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env'
            ],
            plugins: [
              // '@babel/plugin-proposal-class-properties'
              ["@babel/plugin-proposal-decorators", { "legacy": true }], // 将es6的修饰器转为es5
              ["@babel/plugin-proposal-class-properties", { "loose" : true }], // 将es6的class类转为es5
              '@babel/plugin-transform-runtime' // 和上面的class-properties一起使用，装有class-properties的补丁包，一起打包上线
            ]
          }
        },
        include: path.resolve(__dirname, 'src'), // 只包含当前目录下的src目录下的js文件，其余文件不予打包
        exclude: '/node_modules/' // 不包括node_modules目录下的js文件
      },
      {
        test: /\.js$/,
        use: {
          loader: 'eslint-loader',
        },
        enforce: "pre" // 优先级高 pre在其他loader之前
      }
    ] // 规则 
  }, // 模块
  optimization: {
    minimizer: [
      new OptimizeCssAssetsWebpackPlugin(),
      new UglifyjsWebpackPlugin({
        cache: true, // 缓存
        parallel: true, // 并发打包
        sourceMap: true // 源码映射
      }),
    ]
  }, // 优化项
};