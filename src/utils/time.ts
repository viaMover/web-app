import dayjs from 'dayjs';

export const asyncSleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const dateFromExplicitPair = (
  year: number,
  month: number,
  day?: number
): dayjs.Dayjs => dayjs(new Date(year, month - 1, day ?? 1));
