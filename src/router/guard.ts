import { NavigationGuardNext, Route } from 'vue-router';

export const requireCustomCondition = async (
  to: Route,
  from: Route,
  next: NavigationGuardNext
): Promise<void> => {
  const condition = to.meta?.customCondition;
  if (condition !== undefined) {
    if (!condition()) {
      next({ name: 'not-found-route' });
      return;
    }
  }

  next();
};
