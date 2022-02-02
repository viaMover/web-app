import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjsDevHelper from 'dayjs/plugin/devHelper';
import duration from 'dayjs/plugin/duration';
import objectSupport from 'dayjs/plugin/objectSupport';
import utc from 'dayjs/plugin/utc';

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
