const path = require('path'),
    BUILD_DIR = path.resolve(__dirname, 'dist');
    

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        publicPath: '/'
    },
    output: {
        filename: 'bundle.js',
        path: BUILD_DIR,
        publicPath: 'Configurator3D/'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|gif|gltf)$/,
                use: [
                    'file-loader',
                ],
            },
        ],
    },
};