import { isFeatureEnabled } from '@/settings';

const appId = 'z9afldf5';

export type IntercomPayload =
  | Intercom_.IntercomSettings
  | Record<string, string | number>;

const isIntercomEnabled = isFeatureEnabled('isIntercomEnabled');

export const bootIntercomSession = (
  userId: string,
  extra?: IntercomPayload
): void => {
  if (!isIntercomEnabled) {
    return;
  }

  if (window.Intercom === undefined) {
    window.addEventListener('load', () => bootIntercomSession(userId, extra));
  }

  window.Intercom('boot', { app_id: appId, user_id: userId });
  if (extra !== undefined) {
    updateIntercomSession(userId, extra);
  }
};

export const disconnectIntercomSession = (): void => {
  if (!isIntercomEnabled) {
    return;
  }

  if (window.Intercom === undefined) {
    return;
  }

  window.Intercom('shutdown');
};

export const updateIntercomSession = (
  userId: string,
  payload?: IntercomPayload
): void => {
  if (!isIntercomEnabled) {
    return;
  }

  if (window.Intercom === undefined) {
    return;
  }

  window.Intercom('update', payload);
};

export const toggleIntercomVisibility = (isVisible = true): void => {
  if (!isIntercomEnabled) {
    return;
  }

  if (window.Intercom === undefined) {
    return;
  }

  if (isVisible) {
    window.Intercom('show');
    return;
  }

  window.Intercom('hide');
};
