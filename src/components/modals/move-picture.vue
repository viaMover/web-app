<template>
  <custom-picture
    :alt="$t('asset.txtAlt', { name: 'MOVE' })"
    :picture-style="pictureStyles"
    :sources="pictureSources"
    :src="pictureSrc"
  />
</template>

<script lang="ts">
import Vue from 'vue';

import { CustomPicture, PictureSourceDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'MovePicture',
  components: {
    CustomPicture
  },
  data() {
    return {
      pictureSrc: require('@/assets/images/MOVE.png'),
      pictureSources: [
        { src: require('@/assets/images/MOVE.png') },
        { src: require('@/assets/images/MOVE@2x.png'), variant: '2x' }
      ] as Array<PictureSourceDescriptor>,
      pictureStyles: {
        boxShadow: '0px 0px 16px rgb(195, 236, 52)'
      }
    };
  }
});
</script>
