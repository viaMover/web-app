<template>
  <custom-picture
    :alt="$t('asset.txtAlt', { name: 'ETH' })"
    :picture-style="pictureStyles"
    :sources="pictureSources"
    :src="pictureSrc"
  />
</template>

<script lang="ts">
import Vue from 'vue';

import { CustomPicture, PictureSourceDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'EthPicture',
  components: {
    CustomPicture
  },
  data() {
    return {
      pictureSrc: require('@/assets/images/ETH.png'),
      pictureSources: [
        { src: require('@/assets/images/ETH.png') },
        { src: require('@/assets/images/ETH@2x.png'), variant: '2x' }
      ] as Array<PictureSourceDescriptor>,
      pictureStyles: {
        boxShadow: '0px 0px 16px rgba(53, 119, 190, 1)'
      }
    };
  }
});
</script>
