import { NavigationGuardNext, RawLocation, Route } from 'vue-router';

import router from '@/router/index';
import { Globals, isFeatureEnabled } from '@/settings';
export const checkFeatureFlags =
  <T extends Array<keyof Globals>>(
    features: T,
    redirectLocation?: RawLocation
  ) =>
  (to: Route, from: Route, next: NavigationGuardNext): void => {
    const store = router.app.$store;

    if (
      features.find((feature) => {
        !isFeatureEnabled(feature, store.state?.account?.networkInfo?.network);
      }) !== undefined
    ) {
      next(redirectLocation ?? { name: 'not-found-route' });
      return;
    }

    next();
  };
