const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        app: path.resolve('index.js'),
    },
    output: {
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
    }
}
