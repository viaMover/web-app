import Vue from 'vue';
import App from './app.vue';
import router from './router';
import store from './store';
import i18n from './i18n';

import './styles/styles.less';

import * as dayjs from './dayjs';
Vue.config.productionTip = false;

dayjs.init();

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App)
}).$mount('#app');
