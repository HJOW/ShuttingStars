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
                    },
                    "mangle" : {
                        "keep_classnames" : true
                    }
                }
            })
        ]
    },
    "module" : {
        "rules" : [
            {
                "test" : /\.(ts|js|mjs)$/,
                "exclude" : [
                    '/node_modules/',
                    '/src/main/webapp/resources/js/dist/',
                    '/src/main/webapp/resources/js/wc-monaco/',
                    '/src/main/webapp/resources/js/jquery-1.12.4.min.js',
                    '/src/main/webapp/resources/js/crypto-js.min.js'
                ],
                "use" : {
                    "loader" : "babel-loader"
                }
            }
        ]
    },
    "plugins" : [
        new CleanWebpackPlugin({
            "cleanAfterEveryBuildPatterns" : ['**/*.LICENSE.txt'],
            "protectWebpackAssets" : false
        }),
        new webpack.BannerPlugin({
            "banner" : `/**
 * @author HJOW <hujinone22@naver.com>
 * @license Apache-2.0 
 */`,
            "footer" : false,
            "raw" : true,
            "stage" : webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
        })
    ],
    "performance" : {
        "hints" : "warning",
        "maxAssetSize" : 2097152,
        "maxEntrypointSize" : 2097152
    }
}