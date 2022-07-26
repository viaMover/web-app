const publicPath = process.env.VUE_APP_PUBLIC_HOST ?? '/';

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {
  productionSourceMap: true,
  publicPath: publicPath,
  transpileDependencies: ['web3modal-vue'],
  css: {
    sourceMap: process.env.NODE_ENV !== 'production'
  },
  configureWebpack: {
    devtool: 'sourcemap'
  },
  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        args[0].title = 'Mover - web3 debit card.';
        args[0].meta = {
          description: "The only web3 card you'll ever need - Mover.",
          'og:title': 'Mover - web3 debit card.',
          'og:description': "The only web3 card you'll ever need - Mover.",
          'og:type': 'website',
          'og:image': `${publicPath}img/socials/social.png`,
          'twitter:title': 'Mover - web3 debit card.',
          'twitter:description': "The only web3 card you'll ever need - Mover.",
          'twitter:card': 'summary_large_image',
          'twitter:site': '@viaMover',
          'twitter:image': `${publicPath}img/socials/social.png`
        };
        return args;
      })
      .end();

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
