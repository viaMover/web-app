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
    component: () =>
      import(
        /* webpackChunkName: "savings" */ '@/views/savings/savings-root.vue'
      ),
    children: [
      {
        path: 'month-statistics',
        name: 'savings-month-stats',
        component: () =>
          import(
            /* webpackChunkName: "savings" */ '@/views/savings/savings-monthly-statistics.vue'
          )
      },
      {
        path: 'deposit',
        name: 'savings-deposit',
        component: () =>
          import(
            /* webpackChunkName: "savings"*/ '@/views/savings/savings-deposit.vue'
          )
      },
      {
        path: 'withdraw',
        name: 'savings-withdraw',
        component: () =>
          import(
            /* webpackChunkName: "savings"*/ '@/views/savings/savings-withdraw.vue'
          )
      },
      {
        path: '',
        name: 'savings-manage',
        component: () =>
          import(
            /* webpackChunkName: "savings"*/ '@/views/savings/savings-manage.vue'
          )
      }
    ]
  },
  {
    path: '/treasury',
    component: () =>
      import(
        /* webpackChunkName: "treasury" */ '@/views/treasury/treasury-root.vue'
      ),
    children: [
      {
        path: 'month-statistics',
        name: 'treasury-month-stats',
        component: () =>
          import(
            /* webpackChunkName: "treasury" */ '@/views/treasury/treasury-monthly-statistics.vue'
          )
      },
      {
        path: 'increase-boost',
        name: 'treasury-deposit',
        component: () =>
          import(
            /* webpackChunkName: "treasury"*/ '@/views/treasury/treasury-increase-boost.vue'
          )
      },
      {
        path: 'decrease-boost',
        name: 'treasury-decrease-boost',
        component: () =>
          import(
            /* webpackChunkName: "treasury"*/ '@/views/treasury/treasury-decrease-boost.vue'
          )
      },
      {
        path: 'claim-and-burn',
        name: 'treasury-claim-and-burn',
        component: () =>
          import(
            /* webpackChunkName: "treasury"*/ '@/views/treasury/treasury-claim-and-burn.vue'
          )
      },
      {
        path: '',
        name: 'treasury-manage',
        component: () =>
          import(
            /* webpackChunkName: "treasury"*/ '@/views/treasury/treasury-manage.vue'
          )
      }
    ]
  },
  {
    path: '/governance',
    component: () =>
      import(
        /* webpackChunkName: "governance" */ '@/views/governance/governance-root.vue'
      ),
    children: [
      {
        path: 'create',
        name: 'governance-create',
        component: () =>
          import(
            /* webpackChunkName: "governance" */ '@/views/governance/governance-create-proposal.vue'
          )
      },
      {
        path: 'view/:id',
        name: 'governance-view',
        component: () =>
          import(
            /* webpackChunkName: "governance" */ '@/views/governance/governance-view.vue'
          )
      },
      {
        path: '',
        name: 'governance-view-all',
        component: () =>
          import(
            /* webpackChunkName: "governance" */ '@/views/governance/governance-view-all.vue'
          )
      }
    ]
  },
  {
    path: '/nibble-shop',
    component: () =>
      import(
        /* webpackChunkName: "nibble-shop" */ '@/views/nibble-shop/nibble-shop-root.vue'
      ),
    children: [
      {
        path: 'view/:id',
        name: 'nibble-shop-view',
        component: () =>
          import(
            /* webpackChunkName: "nibble-shop" */ '@/views/nibble-shop/nibble-shop-view.vue'
          )
      },
      {
        path: 'buy/:id',
        name: 'nibble-shop-buy',
        component: () =>
          import(
            /* webpackChunkName: "nibble-shop" */ '@/views/nibble-shop/nibble-shop-buy.vue'
          )
      },
      {
        path: 'sell/:id',
        name: 'nibble-shop-sell',
        component: () =>
          import(
            /* webpackChunkName: "nibble-shop" */ '@/views/nibble-shop/nibble-shop-sell.vue'
          )
      },
      {
        path: 'redeem/:id',
        name: 'nibble-shop-redeem',
        component: () =>
          import(
            /* webpackChunkName: "nibble-shop" */ '@/views/nibble-shop/nibble-shop-redeem.vue'
          )
      },
      {
        path: 'no-nft',
        name: 'nibble-shop-no-nft',
        component: () =>
          import(
            /* webpackChunkName: "nibble-shop" */ '@/views/nibble-shop/nibble-shop-no-nft.vue'
          )
      },
      {
        path: '',
        name: 'nibble-shop-view-all',
        component: () =>
          import(
            /* webpackChunkName: "nibble-shop" */ '@/views/nibble-shop/nibble-shop-view-all.vue'
          )
      }
    ]
  },
  {
    path: '/nft-drops',
    name: 'nft-drops',
    component: () =>
      import(/* webpackChunkName: "nft-drops" */ '@/views/home.vue')
  },
  {
    path: '/nft-drops/view/:id',
    name: 'nft-asset-exact-page',
    component: () =>
      import(/* webpackChunkName: "nft-drops" */ '@/views/home.vue')
  },
  {
    path: '/transactions/:txHash',
    name: 'transaction',
    component: () =>
      import(/* webpackChunkName: "transaction" */ '@/views/transaction.vue')
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
