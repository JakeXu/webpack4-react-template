const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const HtmlIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const baseWebpackConfig = require("./webpack.base.conf");
const webpackFile = require('./webpack.file.conf');
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const entry = require("./webpack.entry.conf");
// const webpackCom = require("./webpack.com.conf");

let config = merge(baseWebpackConfig, {
    /* 设置生产环境 */
    mode: 'production',
    output: {
        path: path.resolve(webpackFile.proDirectory),
        filename: 'js/[name].[chunkhash:8].js',
        chunkFilename: "js/[name]-[id].[chunkhash:8].js",
    },
    plugins: [
        new CleanWebpackPlugin([path.resolve('dist')], {
            root: path.join(__dirname, '../../'), //根目录
            verbose: true, //开启在控制台输出信息
            dry: false //启用删除文件
        }),
        new CopyWebpackPlugin([
            {from: path.resolve('dll/react.dll.js'), to: path.resolve('dist/js')},
        ]),
        new webpack.DllReferencePlugin({
            manifest: require(path.join(__dirname, '../../dll', 'react.manifest.json'))
        }),
        new HtmlIncludeAssetsPlugin({
            assets: ['js/react.dll.js'],
            append: false
        }),
        // Compress extracted CSS. We are using this plugin so that possible
        // duplicated CSS from different components can be deduped.
        new OptimizeCSSPlugin({
            assetNameRegExp: /\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                discardComments: {removeAll: true},
                // 避免 cssnano 重新计算 z-index
                safe: true
            },
            canPrint: true
        }),
        new ParallelUglifyPlugin({
            workerCount: 4, // 开启几个子进程去并发的执行压缩，默认是当前电脑的cpu数量减1
            uglifyJS: {
                output: {
                    beautify: false, // 不需要格式化
                    comments: false // 保留注释
                },
                compress: {
                    warnings: false, // Uglifyjs 删除没用代码时，不输出警告
                    // drop_console: true, // 删除所有console语句
                    collapse_vars: true,
                    reduce_vars: true
                }
            }
        })
    ],
    optimization: {
        // minimizer: [
        //     new UglifyJsPlugin({
        //         cache: true,
        //         parallel: true,
        //         sourceMap: true,
        //         uglifyOptions: {
        //             output: {
        //                 comments: false/*删除版权信息*/
        //             },
        //             compress: {
        //                 warnings: false
        //             }
        //         }
        //     })
        // ]
    }
});
// let pages = entry;
// for (let chunkName in pages) {
//     let conf = {
//         filename: chunkName + '.html',
//         template: 'index.html',
//         inject: true,
//         title: webpackCom.titleFun(chunkName,pages[chunkName][1]),
//         minify: {
//             removeComments: true,
//             collapseWhitespace: true,
//             removeAttributeQuotes: true
//         },
//         chunks: ['manifest', 'vendor', 'common', chunkName],
//         hash: false,
//         chunksSortMode: 'dependency'
//     };
//     config.plugins.push(new HtmlWebpackPlugin(conf));
// }
/* 清除 pc */
// config.plugins.push(webpackFile.cleanFun([webpackFile.proDirectory]));
/* 拷贝静态资源  */
// webpackFile.copyArr.map(function (data) {
//     return config.plugins.push(data)
// });
module.exports = config;
