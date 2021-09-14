<template>
  <custom-picture
    :alt="$t('icon.txtSwapDetailsIconAlt')"
    :sources="pictureSources"
    :src="pictureSrc"
    :webp-sources="pictureWebpSources"
  />
</template>

<script lang="ts">
import Vue from 'vue';

import { CustomPicture, PictureSourceDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'DetailsPicture',
  components: {
    CustomPicture
  },
  data() {
    return {
      pictureSrc: require('@/assets/images/Details.png'),
      pictureSources: [
        { src: require('@/assets/images/Details.png') },
        { src: require('@/assets/images/Details@2x.png'), variant: '2x' }
      ] as Array<PictureSourceDescriptor>,
      pictureWebpSources: [
        { src: require('@/assets/images/Details.webp') },
        { src: require('@/assets/images/Details@2x.webp'), variant: '2x' }
      ] as Array<PictureSourceDescriptor>
    };
  }
});
</script>
