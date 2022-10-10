const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'production',
    entry: {
        app: path.resolve('index.js'),
    },
    output: {
        filename: "app.js",
        path: path.resolve('./build'),
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    externals: [nodeExternals()]
}
