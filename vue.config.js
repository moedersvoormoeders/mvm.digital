module.exports = {
    publicPath: "./",
    "runtimeCompiler": true,
    configureWebpack: {
        externals: {
          // global app config object
          config: JSON.stringify({
              //apiUrl: 'https://api.mvm.digital'
              apiUrl: process.env.APIURL? process.env.APIURL : 'http://localhost:8080',
          })
        },
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
              chunks: 'all',
              maxInitialRequests: Infinity,
              minSize: 0,
              cacheGroups: {
                vendor: {
                  test: /[\\/]node_modules[\\/]/,
                  name(module) {
                    // get the name. E.g. node_modules/packageName/not/this/part.js
                    // or node_modules/packageName
                    const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
        
                    // npm package names are URL-safe, but some servers don't like @ symbols
                    return `npm.${packageName.replace('@', '')}`;
                  },
                },
              },
            },
          },
    },
}