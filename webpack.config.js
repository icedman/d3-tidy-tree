const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname,
        filename: 'dist/d3TidyTree.js'
    },
    plugins: [
        new MinifyPlugin()
    ]
};
