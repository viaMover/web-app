module.exports = {
  transpileDependencies: ['web3modal-vue'],

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'i18n/messages',
      enableInSFC: false,
      enableBridge: false
    }
  }
};
