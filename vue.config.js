module.exports = {
  transpileDependencies: ['web3modal-vue'],
  css: {
    sourceMap: process.env.NODE_ENV !== 'production'
  },
  configureWebpack: {
    devtool: 'sourcemap'
  },
  chainWebpack: (config) => {
    config.module
      .rule('fonts')
      .use('url-loader')
      .tap((options) => {
        options.fallback.options.name = 'fonts/[name].[contenthash:8].[ext]';
        return options;
      })
      .end();

    config.module
      .rule('images')
      .use('url-loader')
      .tap((options) => {
        options.fallback.options.name = 'img/[name].[contenthash:8].[ext]';
        return options;
      })
      .end();

    config.module
      .rule('svg')
      .use('file-loader')
      .tap((options) => {
        options.name = 'img/[name].[contenthash:8].[ext]';
        return options;
      })
      .end();

    config.module
      .rule('media')
      .use('url-loader')
      .tap((options) => {
        options.fallback.options.name = 'media/[name].[contenthash:8].[ext]';
        return options;
      })
      .end();

    return config;
  }
};
