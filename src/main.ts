import Vue from 'vue';
import ImageFallback from 'vue-image-fallback';
import Skeleton from 'vue-loading-skeleton';
import Vuelidate from 'vuelidate';

import { Integrations } from '@sentry/tracing';
import * as Sentry from '@sentry/vue';

import { NativeCurrencyFormatterMixin } from '@/utils/native-currency-formatter-mixin';
import { NetworkDataMixin } from '@/utils/network-data-mixin';

import '@/styles/styles.less';

import App from './app.vue';
import * as bignumber from './bignumber';
import * as dayjs from './dayjs';
import i18n from './i18n';
import router from './router';
import { isConsoleEnabled, isDevelop } from './settings';
import store from './store';

if (!isConsoleEnabled()) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.warn = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.info = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.log = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.debug = () => {};
}
Vue.config.productionTip = false;
Vue.use(Vuelidate);
Vue.use(Skeleton);
Vue.use(ImageFallback);

dayjs.init();
bignumber.init();

if (!isDevelop()) {
  Sentry.init({
    Vue,
    dsn: 'https://60ca92e2ab5145578629635f9f85d375@o485123.ingest.sentry.io/5930795',
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: ['app.viamover.com', 'stg.viamover.com']
      })
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    logErrors: true,
    environment: process.env.VUE_APP_SENTRY_ENV,
    trackComponents: true
  });
}

new Vue({
  router,
  store,
  i18n,
  mixins: [NativeCurrencyFormatterMixin, NetworkDataMixin],
  render: (h) => h(App)
}).$mount('#app');
