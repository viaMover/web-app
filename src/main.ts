import Vue from 'vue';
import Vuelidate from 'vuelidate';
import Skeleton from 'vue-loading-skeleton';
import App from './app.vue';
import router from './router';
import store from './store';
import i18n from './i18n';
import ImageFallback from 'vue-image-fallback';

import * as dayjs from './dayjs';
import * as bignumber from './bignumber';

import '@/styles/_fonts.less';
import '@/styles/_page_transitions.less';

if (process.env.NODE_ENV === 'production') {
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

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App)
}).$mount('#app');
