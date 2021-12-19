import { NavigationGuardNext, RawLocation, Route } from 'vue-router';

import { Globals, isFeatureEnabled } from '@/settings';

export const checkFeatureFlag =
  <T extends keyof Globals>(feature: T, redirectLocation?: RawLocation) =>
  (to: Route, from: Route, next: NavigationGuardNext): void => {
    if (!isFeatureEnabled(feature)) {
      next(redirectLocation ?? { name: 'not-found-route' });
      return;
    }

    next();
  };
