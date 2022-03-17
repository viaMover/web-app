import { addBreadcrumb as originalFunction } from '@sentry/vue';

import { isProduction } from '@/settings';

export let addSentryBreadcrumb = originalFunction;
if (!isProduction()) {
  addSentryBreadcrumb = (breadcrumb) => {
    switch (breadcrumb.type) {
      case 'error':
        console.error(breadcrumb.message, breadcrumb);
        break;
      case 'info':
        console.info(breadcrumb.message, breadcrumb);
        break;
      case 'debug':
        console.debug(breadcrumb.message, breadcrumb);
        break;
    }

    originalFunction(breadcrumb);
  };
}
