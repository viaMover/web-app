import { IVueI18n } from 'vue-i18n';

import { Avatar } from '@/store/modules/account/types';

const olympusAvatarId = 'moving-with-olympus';
export const getOlympusAvatar = (i18n: IVueI18n | null): Avatar => ({
  id: olympusAvatarId,
  type: 'image',
  imageAlt:
    (i18n?.t('icon.txtMovingWithOlympusAvatarAlt') as string) ??
    'Moving with Olympus',
  imageSrc: require('@/assets/images/olympus_unique_avatar.png'),
  color: '#ecebeb'
});

export const isOlympusAvatar = (avatar?: Avatar): boolean => {
  return avatar?.id === olympusAvatarId;
};
