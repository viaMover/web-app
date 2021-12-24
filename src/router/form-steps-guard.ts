import { NavigationGuardNext, Route } from 'vue-router';

export const formStepsGuard =
  (routeName: string) =>
  (to: Route, from: Route, next: NavigationGuardNext): void => {
    if (to.params.step === 'prepare') {
      next();
      return;
    }

    if (from.name !== routeName || to.params.step === undefined) {
      next({
        name: routeName,
        params: { step: 'prepare' }
      });
      return;
    }

    next();
  };
