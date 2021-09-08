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
      pictureSrc: require('@/assets/images/Flip.png'),
      pictureSources: [
        { src: require('@/assets/images/Flip.png') },
        { src: require('@/assets/images/Flip@2x.png'), variant: '2x' }
      ] as Array<PictureSourceDescriptor>,
      pictureWebpSources: [
        { src: require('@/assets/images/Flip.webp') },
        { src: require('@/assets/images/Flip@2x.webp'), variant: '2x' }
      ] as Array<PictureSourceDescriptor>
    };
  }
});
</script>
