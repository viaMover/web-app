import Vue from 'vue';
import Vuelidate from 'vuelidate';
import App from './app.vue';
import router from './router';
import store from './store';
import i18n from './i18n';

// import './styles/styles.less';

import * as dayjs from './dayjs';
Vue.config.productionTip = false;
Vue.use(Vuelidate);

dayjs.init();

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App)
}).$mount('#app');
