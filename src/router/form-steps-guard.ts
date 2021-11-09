import { NavigationGuardNext, Route } from 'vue-router';

export const formStepsGuard =
  (routeName: string) =>
  (to: Route, from: Route, next: NavigationGuardNext): void => {
    if (to.params.step === 'prepare') {
      next();
      return;
    }

    if (from.name !== routeName) {
      next({
        name: routeName,
        params: { step: 'prepare' }
      });
      return;
    }

    next();
  };
