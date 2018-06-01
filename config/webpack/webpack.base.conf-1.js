const json = require('../../package.json');//引进package.json
const newEntry = {
    'index': './src/entry/index.js',
    'shop': './src/entry/shop.js',
};

newEntry.vendor = Object.keys(json.dependencies); //把 package.json dependencies字段的值放进 vendor中

let config = {
    entry: newEntry,
    resolve: {
        extensions: [".js", ".json", ".jsx", ".css", ".pcss"],
    }
};
module.exports = config;
