// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname,
        filename: 'dist/d3TidyTree.js'
    },
    plugins: [
        // new UglifyJSPlugin()
    ]
};
