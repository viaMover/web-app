import dayjs from 'dayjs';
import dayjsDevHelper from 'dayjs/plugin/devHelper';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import calendar from 'dayjs/plugin/calendar';
import objectSupport from 'dayjs/plugin/objectSupport';

export function init(): void {
  dayjs.extend(dayjsDevHelper);
  dayjs.extend(customParseFormat);
  dayjs.extend(utc);
  dayjs.extend(calendar);
  dayjs.extend(objectSupport);
}
