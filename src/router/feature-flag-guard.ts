import { NavigationGuardNext, Route } from 'vue-router';

import { Globals, isFeatureEnabled } from '@/settings';

export const checkFeatureFlag =
  <T extends keyof Globals>(feature: T) =>
  (to: Route, from: Route, next: NavigationGuardNext): void => {
    if (!isFeatureEnabled(feature)) {
      next({ name: 'not-found-route' });
      return;
    }

    next();
  };
