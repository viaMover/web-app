import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjsDevHelper from 'dayjs/plugin/devHelper';
import objectSupport from 'dayjs/plugin/objectSupport';
import utc from 'dayjs/plugin/utc';

export function init(): void {
  dayjs.extend(dayjsDevHelper);
  dayjs.extend(customParseFormat);
  dayjs.extend(utc);
  dayjs.extend(calendar);
  dayjs.extend(objectSupport);
}
