const webpack = require('webpack');//引入webpack
const opn = require('opn');//打开浏览器
const merge = require('webpack-merge');//webpack配置文件合并
const path = require("path");
const baseWebpackConfig = require("./webpack.base.conf");//基础配置
const webpackFile = require("./webpack.file.conf");//一些路径配置

let config = merge(baseWebpackConfig, {
    /*设置开发环境*/
    mode: 'development',
    output: {
        path: path.resolve(webpackFile.devDirectory),
        filename: 'js/[name].js',
        chunkFilename: "js/[name].js",
        publicPath: ''
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        /*设置热更新*/
        new webpack.HotModuleReplacementPlugin(),
        // new HtmlWebpackPlugin({
        //     // version: dirVars.version,
        //     template: 'template/index.html',
        //     // favicon: 'src/public/img/favicon.ico',
        //     inject: 'body',
        //     filename: `index.html`,
        //     chunksSortMode: 'dependency',
        //     chunks: ['vendor', 'common', 'index']
        // }),
        /* common 业务公共代码，vendor引入第三方 */
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: ["common", "vendor"],
        // }),
        // /* 防止 vendor hash 变化 */
        // // extract webpack runtime and module manifest to its own file in order to
        // // prevent vendor hash from being updated whenever app bundle is updated
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'manifest',
        //     chunks: ['vendor']
        // }),
    ],
    /*设置api转发*/
    devServer: {
        host: '0.0.0.0',
        port: 9527,
        compress: true, // 开启Gzip压缩
        hot: true,
        inline: true,
        contentBase: path.resolve(webpackFile.devDirectory),
        historyApiFallback: true,
        disableHostCheck: true,
        proxy: [
            {
                context: ['/api/**', '/u/**'],
                target: 'http://192.168.12.100:8080/',
                secure: false
            }
        ],
        /*打开浏览器 并打开本项目网址*/
        after() {
            opn('http://localhost:' + this.port);
        }
    }
});
module.exports = config;
