module.exports = {
    lintOnSave: false,
    baseUrl: './',
    configureWebpack: {
        devtool: 'cheap-module-eval-source-map' // For mocha to display code properly
    }
}
