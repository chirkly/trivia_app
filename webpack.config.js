
module.exports={
    target: "web",
    entry: "./app/index.js",
    output: {
        filename: "bundle.js"
    },
    devServer: {
        contentBase: "./app"
    },
    mode: "development",
    module:{
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "eslint-loader",
            },
            {
                test: /\.js$/,
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