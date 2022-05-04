import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjsDevHelper from 'dayjs/plugin/devHelper';
import duration from 'dayjs/plugin/duration';
import objectSupport from 'dayjs/plugin/objectSupport';
import utc from 'dayjs/plugin/utc';

import { Language } from '@/i18n';
import { isDevelop } from '@/settings';

export function init(): void {
  if (isDevelop()) {
    dayjs.extend(dayjsDevHelper);
  }

  dayjs.extend(customParseFormat);
  dayjs.extend(utc);
  dayjs.extend(calendar);
  dayjs.extend(objectSupport);
  dayjs.extend(duration);
}

export async function setDayjsLocale(locale: Language): Promise<boolean> {
  try {
    dayjs.locale(
      await import(
        /* webpackInclude: /(en|ru).js$/ */
        /* webpackExclude: /.d.ts$/ */
        /* webpackChunkName: "dayjs-locales-[request]" */
        /* webpackMode: "lazy" */
        /* webpackPrefetch: true */
        `dayjs/locale/${locale}`
      )
    );
    return true;
  } catch (error) {
    dayjs.locale(locale);
    return false;
  }
}
