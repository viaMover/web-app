import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '@/views/home.vue';
import { loadLanguageAsync } from '@/i18n';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/release-radar',
    name: 'release-radar',
    component: () =>
      import(/* webpackChunkName: "release-radar" */ '@/views/home.vue')
  },
  {
    path: '/debit-card',
    name: 'debit-card',
    component: () =>
      import(/* webpackChunkName: "debit-card" */ '@/views/home.vue')
  },
  {
    path: '/swaps',
    name: 'swaps',
    component: () => import(/* webpackChunkName: "swaps" */ '@/views/swaps.vue')
  },
  {
    path: '/savings',
    name: 'savings',
    component: () =>
      import(/* webpackChunkName: "savings" */ '@/views/home.vue')
  },
  {
    path: '/treasury',
    name: 'treasury',
    component: () =>
      import(/* webpackChunkName: "treasury" */ '@/views/home.vue')
  },
  {
    path: '/governance',
    name: 'governance',
    component: () =>
      import(/* webpackChunkName: "governance" */ '@/views/home.vue')
  },
  {
    path: '/nibble-shop',
    name: 'nibble-shop',
    component: () =>
      import(/* webpackChunkName: "nibble-shop" */ '@/views/home.vue')
  },
  {
    path: '/nibble-shop/:address',
    name: 'shop-asset-exact-page',
    component: () =>
      import(/* webpackChunkName: "shop-asset-page" */ '@/views/home.vue')
  },
  {
    path: '/nft-drops',
    name: 'nft-drops',
    component: () =>
      import(/* webpackChunkName: "nft-drops" */ '@/views/home.vue')
  },
  {
    path: '/nft-drops/:id',
    name: 'nft-asset-exact-page',
    component: () =>
      import(/* webpackChunkName: "nft-asset-page" */ '@/views/home.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  const { lang } = to.params;
  loadLanguageAsync(lang)
    .then(() => next())
    .catch(() => next(false));
});

export default router;
