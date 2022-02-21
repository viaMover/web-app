import { NavigationGuardNext, RawLocation, Route } from 'vue-router';

import router from '@/router/index';
import { Globals, isFeatureEnabled } from '@/settings';
export const checkFeatureFlag =
  <T extends keyof Globals>(feature: T, redirectLocation?: RawLocation) =>
  (to: Route, from: Route, next: NavigationGuardNext): void => {
    const store = router.app.$store;
    if (
      !isFeatureEnabled(feature, store.state?.account?.networkInfo?.network)
    ) {
      next(redirectLocation ?? { name: 'not-found-route' });
      return;
    }

    next();
  };
