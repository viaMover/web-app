import Vue from 'vue';
import VueRouter, { RawLocation, RouteConfig } from 'vue-router';

import { loadLanguageAsync } from '@/i18n';
import { checkFeatureFlag } from '@/router/feature-flag-guard';
import { requireWalletAuth } from '@/router/wallet-auth-guard';
import { isFeatureEnabled } from '@/settings';
import { ActiveProviders } from '@/store/modules/earnings/utils';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/home.vue')
  },
  {
    path: '/more',
    name: 'home-more',
    component: () =>
      import(/* webpackChunkName: "home" */ '@/views/home-more.vue'),
    beforeEnter: checkFeatureFlag('isMoreEnabled')
  },
  {
    path: '/connect-wallet',
    name: 'connect-wallet',
    component: () =>
      import(/* webpackChunkName: "home" */ '@/views/connect-wallet.vue'),
    meta: {
      skipPreloadScreen: true
    }
  },
  {
    path: '/release-radar',
    component: () =>
      import(
        /* webpackChunkName: "release-radar" */ '@/views/release-radar/release-radar-root.vue'
      ),
    children: [
      {
        path: '',
        name: 'release-radar-view-all',
        component: () =>
          import(
            /* webpackChunkName: "release-radar" */ '@/views/release-radar/release-radar-view-all.vue'
          )
      }
    ],
    beforeEnter: checkFeatureFlag('isReleaseRadarEnabled')
  },
  {
    path: '/debit-card',
    name: 'debit-card',
    component: () =>
      import(/* webpackChunkName: "debit-card" */ '@/views/home.vue'),
    beforeEnter: checkFeatureFlag('isDebitCardEnabled')
  },
  {
    path: '/savings',
    component: () =>
      import(
        /* webpackChunkName: "savings" */ '@/views/savings/savings-root.vue'
      ),
    children: [
      {
        path: '',
        name: 'savings-manage',
        component: () =>
          import(
            /* webpackChunkName: "savings"*/ '@/views/savings/savings-manage-wrapper.vue'
          )
      },
      {
        path: 'deposit',
        name: 'savings-deposit',
        component: () =>
          import(
            /* webpackChunkName: "savings"*/ '@/views/savings/savings-deposit-wrapper.vue'
          )
      },
      {
        path: 'withdraw',
        name: 'savings-withdraw',
        component: () =>
          import(
            /* webpackChunkName: "savings"*/ '@/views/savings/savings-withdraw-wrapper.vue'
          )
      },
      {
        path: 'analytics',
        name: 'savings-global-analytics',
        component: () =>
          import(
            /* webpackChunkName: "savings"*/ '@/views/savings/savings-global-analytics.vue'
          )
      },
      {
        path: 'month-statistics/:year/:month',
        name: 'savings-month-stats',
        component: () =>
          import(
            /* webpackChunkName: "savings" */ '@/views/savings/savings-monthly-statistics.vue'
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
        path: 'empty',
        name: 'treasury-empty',
        component: () =>
          import(
            /* webpackChunkName: "treasury" */ '@/views/treasury/treasury-empty.vue'
          )
      },
      {
        path: 'month-statistics/:year/:month',
        name: 'treasury-month-stats',
        component: () =>
          import(
            /* webpackChunkName: "treasury" */ '@/views/treasury/treasury-monthly-statistics.vue'
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
        component: () =>
          import(
            /* webpackChunkName: "governance" */ '@/views/governance/governance-view-root.vue'
          ),
        children: [
          {
            path: '',
            name: 'governance-view',
            component: () =>
              import(
                /* webpackChunkName: "governance" */ '@/views/governance/governance-view.vue'
              )
          },
          {
            path: 'analytics',
            name: 'governance-analytics',
            component: () =>
              import(
                /* webpackChunkName: "governance" */ '@/views/governance/governance-analytics.vue'
              )
          },
          {
            path: 'vote/:decision',
            name: 'governance-vote',
            component: () =>
              import(
                /* webpackChunkName: "governance" */ '@/views/governance/governance-vote.vue'
              )
          }
        ]
      },
      {
        path: 'global-analytics',
        name: 'governance-global-analytics',
        component: () =>
          import(
            /* webpackChunkName: "governance" */ '@/views/governance/governance-global-analytics.vue'
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
    ],
    beforeEnter: checkFeatureFlag('isGovernanceEnabled')
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
        path: '',
        name: 'nibble-shop-view-all',
        component: () =>
          import(
            /* webpackChunkName: "nibble-shop" */ '@/views/nibble-shop/nibble-shop-view-all.vue'
          )
      }
    ],
    beforeEnter: checkFeatureFlag('isNibbleShopEnabled')
  },
  {
    path: '/nft-drops',
    component: () =>
      import(/* webpackChunkName: "nft-drops" */ '@/views/nft/nft-root.vue'),
    children: [
      {
        path: '',
        name: 'nft-view-all',
        component: () =>
          import(
            /* webpackChunkName: "nft-drops" */ '@/views/nft/nft-view-all.vue'
          )
      },
      {
        path: 'view/vaults',
        name: 'vaults',
        component: () =>
          import(
            /* webpackChunkName: "nft-drops" */ '@/views/nft/nft-view-vaults.vue'
          )
      },
      {
        path: 'view/swap-passport',
        name: 'swap-passport',
        component: () =>
          import(
            /* webpackChunkName: "nft-drops" */ '@/views/nft/nft-view-swap-passport.vue'
          )
      },
      {
        path: 'view/sweet-and-sour',
        name: 'sweet-&-sour',
        component: () =>
          import(
            /* webpackChunkName: "nft-drops" */ '@/views/nft/nft-view-sweet-and-sour.vue'
          )
      },
      {
        path: 'view/unexpected-move',
        name: 'unexpected-move',
        component: () =>
          import(
            /* webpackChunkName: "nft-drops" */ '@/views/nft/nft-view-unexpected-move.vue'
          )
      },
      {
        path: 'view/moving-with-olympus',
        name: 'moving-with-olympus',
        component: () =>
          import(
            /* webpackChunkName: "nft-drops" */ '@/views/nft/nft-view-moving-with-olympus.vue'
          )
      },
      {
        path: 'view/dice-project',
        name: 'dice-project',
        component: () =>
          import(
            /* webpackChunkName: "nft-drops" */ '@/views/nft/nft-view-dice.vue'
          )
      }
    ],
    beforeEnter: checkFeatureFlag('isNftDropsEnabled')
  },
  {
    path: '/transactions/:txHash',
    name: 'transaction',
    component: () =>
      import(/* webpackChunkName: "transaction" */ '@/views/transaction.vue')
  },
  {
    path: '/404',
    name: 'not-found-route',
    component: () =>
      import(/* webpackChunkName: "home" */ '@/views/view-404.vue'),
    meta: {
      skipPreloadScreen: true
    }
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

if (isFeatureEnabled('isEarningsEnabled')) {
  router.addRoute({
    path: '/earnings',
    component: () =>
      import(
        /* webpackChunkName: "earnings" */ '@/views/earnings/earnings-root.vue'
      ),
    children: [
      {
        path: 'ethereum',
        components: {
          default: () =>
            import(
              /* webpackChunkName: "earnings" */ '@/views/earnings/ethereum/earnings-ethereum-root.vue'
            ),
          manage: () =>
            import(
              /* webpackChunkName: "earnings" */ '@/components/earnings/ethereum/earnings-manage-ethereum-left-rail-item.vue'
            )
        },
        children: [
          {
            path: 'stake',
            name: 'earnings-ethereum-stake',
            component: () =>
              import(
                /* webpackChunkName: "earnings" */ '@/views/earnings/ethereum/earnings-ethereum-stake.vue'
              )
          },
          {
            path: 'withdraw',
            name: 'earnings-ethereum-withdraw',
            component: () =>
              import(
                /* webpackChunkName: "earnings" */ '@/views/earnings/ethereum/earnings-ethereum-withdraw.vue'
              )
          },
          {
            path: 'global-analytics',
            name: 'earnings-ethereum-global-analytics',
            component: () =>
              import(
                /* webpackChunkName: "earnings" */ '@/views/earnings/ethereum/earnings-ethereum-global-analytics.vue'
              )
          },
          {
            path: '',
            name: 'earnings-ethereum-manage',
            component: () =>
              import(
                /* webpackChunkName: "earnings" */ '@/views/earnings/ethereum/earnings-ethereum-manage.vue'
              )
          }
        ],
        beforeEnter: checkFeatureFlag('isEarningsEthereumEnabled', {
          name: 'earnings-manage'
        })
      },
      {
        path: 'olympus',
        components: {
          default: () =>
            import(
              /* webpackChunkName: "earnings" */ '@/views/earnings/olympus/earnings-olympus-root.vue'
            ),
          manage: () =>
            import(
              /* webpackChunkName: "earnings" */ '@/components/earnings/olympus/earnings-manage-olympus-left-rail-item.vue'
            )
        },
        children: [
          {
            path: 'stake/step/:step?',
            name: 'earnings-olympus-stake',
            component: () =>
              import(
                /* webpackChunkName: "earnings" */ '@/views/earnings/olympus/earnings-olympus-stake.vue'
              ),
            props: (to) => ({
              currentStep: to.params.step
            }),
            beforeEnter: (to, from, next) => {
              if (to.params.step === 'prepare') {
                next();
                return;
              }

              if (from.name !== 'earnings-olympus-stake') {
                next({
                  name: 'earnings-olympus-stake',
                  params: { step: 'prepare' }
                });
                return;
              }

              next();
            }
          },
          {
            path: 'withdraw',
            name: 'earnings-olympus-withdraw',
            component: () =>
              import(
                /* webpackChunkName: "earnings" */ '@/views/earnings/olympus/earnings-olympus-withdraw.vue'
              )
          },
          {
            path: 'global-analytics',
            name: 'earnings-olympus-global-analytics',
            component: () =>
              import(
                /* webpackChunkName: "earnings" */ '@/views/earnings/olympus/earnings-olympus-global-analytics.vue'
              )
          },
          {
            path: '',
            name: 'earnings-olympus-manage',
            component: () =>
              import(
                /* webpackChunkName: "earnings" */ '@/views/earnings/olympus/earnings-olympus-manage.vue'
              )
          }
        ],
        beforeEnter: checkFeatureFlag('isEarningsOlympusEnabled', {
          name: 'earnings-manage'
        })
      },
      {
        path: '',
        name: 'earnings-manage',
        redirect: (): RawLocation => {
          if (ActiveProviders.length < 1) {
            return { name: 'not-found-route' };
          }

          return { name: `earnings-${ActiveProviders[0]}-manage` };
        }
      }
    ]
  });
}

router.addRoute({
  path: '*',
  name: 'any-route',
  redirect: {
    name: 'not-found-route'
  }
});

if (isFeatureEnabled('isNavigationFallbackEnabled')) {
  // detect initial navigation
  let isInitialNavigation = false;
  router.beforeEach((to, from, next) => {
    isInitialNavigation = from === VueRouter.START_LOCATION;
    next();
  });

  // save original router.back() implementation bound to the initial router
  const originalRouterBack = router.back.bind(router);

  // substitute with the custom implementation
  router.back = async (): Promise<void> => {
    if (isInitialNavigation && router.currentRoute.name !== 'home') {
      await router.replace({ name: 'home' });
      return;
    }

    originalRouterBack();
  };
}

router.beforeEach((to, from, next) => {
  const { lang } = to.params;
  loadLanguageAsync(lang)
    .then(() => next())
    .catch(() => next(false));
});

router.beforeResolve(requireWalletAuth(['connect-wallet', 'not-found-route']));

export default router;
