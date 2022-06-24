import {
  addBreadcrumb as originalAddSentryBreadcrumb,
  captureException as originalCaptureException
} from '@sentry/vue';

import { isConsoleEnabled } from '@/settings';

export let addSentryBreadcrumb = originalAddSentryBreadcrumb;
if (isConsoleEnabled()) {
  addSentryBreadcrumb = (breadcrumb) => {
    switch (breadcrumb.type) {
      case 'error':
        console.error(breadcrumb.message, breadcrumb);
        break;
      case 'info':
        console.info(breadcrumb.message, breadcrumb);
        break;
      case 'warning':
        console.warn(breadcrumb.message, breadcrumb);
        break;
      case 'debug':
        console.debug(breadcrumb.message, breadcrumb);
        break;
    }

    originalAddSentryBreadcrumb(breadcrumb);
  };
}

export let captureSentryException = originalCaptureException;
if (isConsoleEnabled()) {
  captureSentryException = (exception, captureContext) => {
    console.error(exception, { captureContext });
    return originalCaptureException(exception, captureContext);
  };
}
