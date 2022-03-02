import Vue from 'vue';
import VueRouter, { NavigationFailureType, RouteConfig } from 'vue-router';

import { loadLanguageAsync } from '@/i18n';
import {
  wrapWithCustomPreloadView,
  wrapWithMeta
} from '@/router/descending-meta-wrapper';
import { checkFeatureFlags } from '@/router/feature-flag-guard';
import { requireWalletAuth } from '@/router/wallet-auth-guard';
import { isFeatureEnabled } from '@/settings';
import ConnectWallet from '@/views/connect-wallet.vue';
import Home from '@/views/home.vue';
import More from '@/views/more.vue';
import PreloadMore from '@/views/preload/preload-more.vue';
import View404 from '@/views/view-404.vue';

import { formStepsGuard } from './form-steps-guard';
import { checkCondition } from './guard';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  wrapWithCustomPreloadView(
    {
      path: '/more',
      name: 'more',
      component: More,
      beforeEnter: checkCondition((): boolean => {
        const store = router.app.$store;
        console.log('dfdfd');
        console.log(
          'dfdfd',
          store.state?.account?.networkInfo?.network,
          isFeatureEnabled(
            'isNibbleShopEnabled',
            store.state?.account?.networkInfo?.network
          ) ||
            isFeatureEnabled(
              'isGovernanceEnabled',
              store.state?.account?.networkInfo?.network
            ) ||
            isFeatureEnabled(
              'isNftDropsEnabled',
              store.state?.account?.networkInfo?.network
            )
        );
        return (
          isFeatureEnabled(
            'isNibbleShopEnabled',
            store.state?.account?.networkInfo?.network
          ) ||
          isFeatureEnabled(
            'isGovernanceEnabled',
            store.state?.account?.networkInfo?.network
          ) ||
          isFeatureEnabled(
            'isNftDropsEnabled',
            store.state?.account?.networkInfo?.network
          )
        );
      })
    },
    PreloadMore
  ),
  wrapWithMeta(
    {
      path: '/connect-wallet',
      name: 'connect-wallet',
      component: ConnectWallet
    },
    {
      skipPreloadScreen: true
    }
  ),
  wrapWithCustomPreloadView(
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
    () =>
      import(
        /* webpackChunkName: "savings" */ '@/views/preload/preload-product/preload-product.vue'
      )
  ),
  wrapWithCustomPreloadView(
    {
      path: '/treasury',
      component: () =>
        import(
          /* webpackChunkName: "treasury" */ '@/views/treasury/treasury-root.vue'
        ),
      children: [
        {
          path: '',
          name: 'treasury-manage',
          component: () =>
            import(
              /* webpackChunkName: "treasury"*/ '@/views/treasury/treasury-manage-wrapper.vue'
            )
        },
        {
          path: 'increase',
          name: 'treasury-increase',
          component: () =>
            import(
              /* webpackChunkName: "treasury"*/ '@/views/treasury/treasury-increase-wrapper.vue'
            )
        },
        {
          path: 'decrease',
          name: 'treasury-decrease',
          component: () =>
            import(
              /* webpackChunkName: "treasury"*/ '@/views/treasury/treasury-decrease-wrapper.vue'
            )
        },
        {
          path: 'claim-and-burn',
          name: 'treasury-claim-and-burn',
          component: () =>
            import(
              /* webpackChunkName: "treasury"*/ '@/views/treasury/treasury-claim-and-burn-wrapper.vue'
            )
        },
        {
          path: 'claim-and-burn-mobo',
          name: 'treasury-claim-and-burn-mobo',
          component: () =>
            import(
              /* webpackChunkName: "treasury"*/ '@/views/treasury/treasury-claim-and-burn-mobo-wrapper.vue'
            ),
          beforeEnter: checkFeatureFlags(['isTreasuryClaimAndBurnMOBOEnabled'])
        },
        {
          path: 'powercard',
          name: 'treasury-powercard',
          component: () =>
            import(
              /* webpackChunkName: "treasury"*/ '@/views/treasury/treasury-powercard-wrapper.vue'
            )
        },
        {
          path: 'analytics',
          name: 'treasury-global-analytics',
          component: () =>
            import(
              /* webpackChunkName: "treasury"*/ '@/views/treasury/treasury-global-analytics.vue'
            )
        },
        {
          path: 'month-statistics/:year/:month',
          name: 'treasury-month-stats',
          component: () =>
            import(
              /* webpackChunkName: "treasury" */ '@/views/treasury/treasury-monthly-statistics.vue'
            )
        }
      ]
    },
    () =>
      import(
        /* webpackChunkName: "treasury" */ '@/views/preload/preload-product/preload-product.vue'
      )
  ),
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
        components: {
          default: () =>
            import(
              /* webpackChunkName: "governance" */ '@/views/governance/governance-create-proposal.vue'
            ),
          leftRail: () =>
            import(
              /* webpackChunkName: "governance" */ '@/components/governance/governance-left-rail.vue'
            )
        }
      },
      {
        path: 'view/:id',
        components: {
          default: () =>
            import(
              /* webpackChunkName: "governance" */ '@/views/governance/governance-view-root.vue'
            ),
          leftRail: () =>
            import(
              /* webpackChunkName: "governance" */ '@/components/governance/governance-left-rail-view.vue'
            )
        },
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
        components: {
          default: () =>
            import(
              /* webpackChunkName: "governance" */ '@/views/governance/governance-global-analytics.vue'
            ),
          leftRail: () =>
            import(
              /* webpackChunkName: "governance" */ '@/components/governance/governance-left-rail.vue'
            )
        }
      },
      {
        path: '',
        name: 'governance-view-all',
        components: {
          default: () =>
            import(
              /* webpackChunkName: "governance" */ '@/views/governance/governance-view-all.vue'
            ),
          leftRail: () =>
            import(
              /* webpackChunkName: "governance" */ '@/components/governance/governance-left-rail.vue'
            )
        }
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
        path: '',
        name: 'nibble-shop-view-all',
        component: () =>
          import(
            /* webpackChunkName: "nibble-shop" */ '@/views/nibble-shop/nibble-shop-view-all.vue'
          )
      },
      {
        path: 'redeem/:id',
        name: 'nibble-shop-redeem',
        component: () =>
          import(
            /* webpackChunkName: "nibble-shop" */ '@/views/nibble-shop/nibble-shop-redeem.vue'
          )
      }
    ],
    beforeEnter: checkFeatureFlags(['isNibbleShopEnabled'])
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
        path: 'view/order-of-liberty',
        name: 'the-order-of-liberty',
        alias: '/order-of-liberty',
        component: () =>
          import(
            /* webpackChunkName: "nft-drops" */ '@/views/nft/nft-view-order-of-liberty.vue'
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
    ]
  },
  wrapWithMeta(
    {
      path: '/404',
      name: 'not-found-route',
      component: View404
    },
    {
      skipPreloadScreen: true
    }
  )
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

if (isFeatureEnabled('isDebitCardEnabled')) {
  router.addRoute({
    path: '/debit-card',
    component: () =>
      import(
        /* webpackChunkName: "debit-card" */ '@/views/debit-card/debit-card-root.vue'
      ),
    children: [
      {
        path: 'top-up/step/:step',
        name: 'debit-card-top-up',
        component: () =>
          import(
            /* webpackChunkName: "debit-card" */ '@/views/debit-card/debit-card-top-up.vue'
          ),
        props: (to) => ({
          step: to.params.step
        }),
        beforeEnter: (to, from, next) => {
          if (!isFeatureEnabled('isDebitCardTopUpEnabled')) {
            next({ name: 'not-found-route' });
            return;
          }

          formStepsGuard('debit-card-top-up')(to, from, next);
        }
      },
      {
        path: 'change-skin',
        name: 'debit-card-change-skin',
        component: () =>
          import(
            /* webpackChunkName: "debit-card" */ '@/views/debit-card/debit-card-change-skin.vue'
          ),
        beforeEnter: checkFeatureFlags(['isDebitCardChangeSkinEnabled'])
      },
      {
        path: '',
        name: 'debit-card-manage',
        component: () =>
          import(
            /* webpackChunkName: "debit-card" */ '@/views/debit-card/debit-card-manage.vue'
          )
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

router.beforeEach((to, from, next) => {
  const { lang } = to.params;
  loadLanguageAsync(lang)
    .then(() => next())
    .catch(() => next(false));
});

router.beforeResolve(requireWalletAuth(['connect-wallet', 'not-found-route']));

router.onError((error) => {
  if (
    VueRouter.isNavigationFailure(error, NavigationFailureType.duplicated) ||
    VueRouter.isNavigationFailure(error, NavigationFailureType.redirected)
  ) {
    console.warn(`prevented navigation: ${error.message} (${error.type})`);
    return;
  }

  throw error;
});

export default router;
