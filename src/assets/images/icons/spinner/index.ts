import { Theme } from '@/settings/theme';

import { PictureDescriptor } from '@/components/html5';

import spinnerDark from './dark';
import spinnerLight from './light';

export const getThemedPicture = (theme: Theme): PictureDescriptor => {
  return theme === Theme.Dark ? spinnerDark : spinnerLight;
};
