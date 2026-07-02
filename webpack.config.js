const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
    "entry" : "./src/main/webapp/resources/js/shuttingstars.js",
    "output" : {
        "path" : __dirname + "/src/main/webapp/resources/js/dist/",
        "filename" : "shuttingstars.bundle.js",
        "clean" : true
    },
    "mode" : "production",
    "optimization" : {
        "minimize" : true,
        "minimizer" : [
            new TerserPlugin({
                "extractComments" : false,
                "terserOptions" : {
                    "format" : {
                        "comments" : false
                    }
                }
            })
        ]
    },
    "plugins" : [
        new CleanWebpackPlugin({
            "cleanAfterEveryBuildPatterns" : ['**/*.LICENSE.txt'],
            "protectWebpackAssets" : false
        })
    ]
}