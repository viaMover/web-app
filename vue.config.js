module.exports = {
  transpileDependencies: ['web3modal-vue'],
  productionSourceMap: false,
  configureWebpack: {
    optimization: {
      splitChunks: false
    }
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

    if (process.env.SHRINK_RES) {
      config.module
        .rule('images')
        .use('url-loader')
        .loader('url-loader')
        .tap((options) => {
          options.limit = true;
          return options;
        })
        .end();
    } else {
      config.module
        .rule('images')
        .use('url-loader')
        .tap((options) => {
          options.fallback.options.name = 'img/[name].[contenthash:8].[ext]';
          return options;
        })
        .end();
    }

    if (process.env.SHRINK_RES) {
      const svgRule = config.module.rule('svg');
      svgRule.uses.clear();
      svgRule.use('vue-svg-loader').loader('vue-svg-loader');
    } else {
      config.module
        .rule('svg')
        .use('file-loader')
        .tap((options) => {
          options.name = 'img/[name].[contenthash:8].[ext]';
          return options;
        })
        .end();
    }

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
