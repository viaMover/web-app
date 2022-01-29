import { RouteConfig } from 'vue-router';
import {
  Component,
  RouteConfigMultipleViews,
  RouteConfigSingleView
} from 'vue-router/types/router';

export const wrapWithMeta = (
  record: RouteConfig,
  metaEntry: MetaEntry
): RouteConfig => {
  record.meta = { ...record.meta, ...metaEntry };
  if (record.children === undefined) {
    return record;
  }

  for (let i = 0; i < record.children.length; i += 1) {
    record.children[i] = wrapWithMeta(record.children[i], metaEntry);
  }

  return record;
};

export const wrapWithCustomPreloadView = (
  record: RouteConfig,
  preloadView: Component,
  metaEntry?: MetaEntry
): RouteConfig => {
  if (isSingleView(record)) {
    const defaultView = record.component;

    const temp = {
      ...record,
      components: {
        default: defaultView,
        preload: preloadView
      }
    } as RouteConfigMultipleViews;
    delete (temp as RouteConfigSingleView)['component'];

    return wrapWithMeta(temp, {
      ...metaEntry,
      hasOwnPreload: true
    });
  }

  if (isMultipleViews(record)) {
    record.components = { ...record.components, preload: preloadView };
    return wrapWithMeta(record, {
      ...metaEntry,
      hasOwnPreload: true
    });
  }

  // if data structure doesn't match anything then
  // we don't do anything
  return record;
};

interface MetaEntry {
  hasOwnPreload?: boolean;
  skipPreloadScreen?: boolean;
}

const isSingleView = (record: RouteConfig): record is RouteConfigSingleView => {
  return 'component' in record && !('components' in record);
};

const isMultipleViews = (
  record: RouteConfig
): record is RouteConfigMultipleViews => {
  return 'components' in record && !('component' in record);
};
