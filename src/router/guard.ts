import VueRouter, { NavigationGuardNext, Route } from 'vue-router';

export const requireCustomCondition =
  (router: VueRouter) =>
  async (to: Route, from: Route, next: NavigationGuardNext): Promise<void> => {
    const condition = to.meta?.customCondition;
    if (condition !== undefined) {
      if (!condition(router.app?.$store)) {
        next({ name: 'not-found-route' });
        return;
      }
    }

    next();
  };
