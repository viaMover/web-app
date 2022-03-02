import { NavigationGuardNext, RawLocation, Route } from 'vue-router';

export const checkCondition =
  (condition: () => boolean, redirectLocation?: RawLocation) =>
  (to: Route, from: Route, next: NavigationGuardNext): void => {
    if (!condition()) {
      next(redirectLocation ?? { name: 'not-found-route' });
      return;
    }

    next();
  };
