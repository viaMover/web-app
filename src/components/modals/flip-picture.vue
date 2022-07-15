<template>
  <custom-picture
    :alt="$t('icon.txtFlipAssetsIconAlt')"
    :sources="pictureSources"
    :src="pictureSrc"
    :webp-sources="pictureWebpSources"
  />
</template>

<script lang="ts">
import Vue from 'vue';

import { CustomPicture, PictureSourceDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'FlipPicture',
  components: {
    CustomPicture
  },
  data() {
    return {
      pictureSrc:
        'https://storage.googleapis.com/mover-webapp-assets/images/Flip.png',
      pictureSources: [
        {
          src: 'https://storage.googleapis.com/mover-webapp-assets/images/Flip.png'
        },
        {
          src: 'https://storage.googleapis.com/mover-webapp-assets/images/Flip@2x.png',
          variant: '2x'
        }
      ] as Array<PictureSourceDescriptor>,
      pictureWebpSources: [
        {
          src: 'https://storage.googleapis.com/mover-webapp-assets/images/Flip.webp'
        },
        {
          src: 'https://storage.googleapis.com/mover-webapp-assets/images/Flip@2x.webp',
          variant: '2x'
        }
      ] as Array<PictureSourceDescriptor>
    };
  }
});
</script>
