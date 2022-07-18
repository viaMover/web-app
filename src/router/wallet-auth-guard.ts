import { NavigationGuardNext, Route } from 'vue-router';

import router from '@/router/index';
import { updateIntercomSession } from '@/router/intercom-utils';
import { PartnersList } from '@/services/v2/api/mover/tag';
import { setToPersistStore } from '@/settings/persist/utils';

export const requireWalletAuth =
  (excludedRouteNames: Array<string>) =>
  async (to: Route, from: Route, next: NavigationGuardNext): Promise<void> => {
    const store = router.app.$store;

    if (PartnersList.includes(to.params.partner)) {
      await setToPersistStore('all', 'tag', 'partner', to.params.partner);
    }

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
