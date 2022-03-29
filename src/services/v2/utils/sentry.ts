import {
  addBreadcrumb as originalAddSentryBreadcrumb,
  captureException as originalCaptureException
} from '@sentry/vue';

import { isProduction } from '@/settings';

export let addSentryBreadcrumb = originalAddSentryBreadcrumb;
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

    originalAddSentryBreadcrumb(breadcrumb);
  };
}

export let captureException = originalCaptureException;
if (!isProduction()) {
  captureException = (exception, captureContext) => {
    console.error(exception, { captureContext });
    return originalCaptureException(exception, captureContext);
  };
}
