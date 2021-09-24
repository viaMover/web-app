import { NavigationGuardNext, Route } from 'vue-router';
import router from '@/router/index';
import { updateIntercomSession } from '@/router/intercom-utils';

export const requireWalletAuth =
  (excludedRouteNames: Array<string>) =>
  async (to: Route, from: Route, next: NavigationGuardNext): Promise<void> => {
    const store = router.app.$store;
    if (excludedRouteNames.includes(to.name ?? '')) {
      next();
      return;
    }
    const isWalletReady = await store.dispatch('account/waitWallet');
    if (isWalletReady) {
      next();
      updateIntercomSession(store.state['account/currentAddress']);
      return;
    } else {
      next({ name: 'connect-wallet' });
    }
  };
