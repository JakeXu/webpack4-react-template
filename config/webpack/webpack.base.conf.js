const glob = require('glob')
const path = require('path')
const entryDir = resolve('../../src/entry')
const webpackFile = require('./webpack.file.conf');
// const dirVars = require('./dir_vars.config')
const options = {
    cwd: entryDir,
    sync: true
}
const json = require('../../package.json');//引进package.json
const globInstance = new glob.Glob('*.js', options)
const pageEntries = globInstance.found
const entries = {}
entries.vendor = Object.keys(json.dependencies); //把 package.json dependencies字段的值放进 vendor中

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== 'production'

const HappyPack = require('happypack');
const os = require('os'); // 系统操作函数
const happyThreadPool = HappyPack.ThreadPool({size: os.cpus().length}); // 指定线程池个数

function resolve(dir) {
    return path.join(__dirname, dir);
}

let plugins = [
    new webpack.DefinePlugin({ // 定义环境变量
        "process.env": JSON.stringify(process.env.NODE_ENV)
    }),
    new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: devMode ? '[name].css' : '[name].[hash:8].css',
        chunkFilename: devMode ? '[id].css' : '[id].[hash:8].css',
    }),
    new HappyPack({
        id: 'babel',
        loaders: ['babel-loader?cacheDirectory'],
        threadPool: happyThreadPool,
        verbose: true
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
]

pageEntries.forEach((page) => {
    let name = page.replace(/\.\w+$/, '')
    entries[name] = path.join(entryDir, page)
    plugins.push(new HtmlWebpackPlugin({
        // version: dirVars.version,
        template: resolve(`../../template/${name}.html`),
        // favicon: resolve('../../src/public/img/favicon.ico'),
        inject: 'body',
        filename: `${name}.html`,
        chunksSortMode: 'dependency',
        chunks: ['vendor', 'common', name]
    }))
})

module.exports = {
    entry: entries,
    output: {
        path: resolve('../../dist'),
        filename: '[name].js'
    },
    optimization: {
        // runtimeChunk: {
        //     name: "manifest"
        // },
        splitChunks: {
            cacheGroups: {
                commons: {
                    name: 'common',
                    chunks: 'initial',
                    minChunks: 2,
                    maxInitialRequests: 5,
                    minSize: 0
                },
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    chunks: 'initial',
                    name: 'vendor',
                    priority: 10,
                    enforce: true
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.s?[ac]ss$/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|jpg|gif|ttf|eot|woff|woff2|svg)$/,
                loader: 'url-loader?limit=8192&name=[name].[hash:8].[ext]&publicPath=' + webpackFile.resourcePrefix + '&outputPath=' + webpackFile.resource + '/'
            },
            {
                test: /\.swf$/,
                loader: 'file?name=js/[name].[ext]'
            }
        ],
        noParse: function (content) { // content 从入口开始解析的模块路径
            return /no-parser/.test(content); // 返回true则忽略对no-parser.js的解析
        }
    },
    resolve: {
        modules: [ // 优化模块查找路径
            resolve('../../src'),
            resolve('../../node_modules') // 指定node_modules所在位置 当你import第三方模块式 直接从这个路径下搜寻
        ],
        alias: {},
        extensions: ['.js', '.json', '.jsx', '.css', '.less', '.scss', '.sass', '.pcss'],
    },
    plugins: plugins
}
