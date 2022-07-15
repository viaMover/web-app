<template>
  <custom-picture
    :alt="$t('asset.txtAlt', { name: 'USDC' })"
    :picture-style="pictureStyles"
    :sources="pictureSources"
    :src="pictureSrc"
  />
</template>

<script lang="ts">
import Vue from 'vue';

import { CustomPicture, PictureSourceDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'UsdcPicture',
  components: {
    CustomPicture
  },
  data() {
    return {
      pictureSrc:
        'https://storage.googleapis.com/mover-webapp-assets/images/USDC.png',
      pictureSources: [
        {
          src: 'https://storage.googleapis.com/mover-webapp-assets/images/USDC.png'
        },
        {
          src: 'https://storage.googleapis.com/mover-webapp-assets/images/USDC@2x.png',
          variant: '2x'
        }
      ] as Array<PictureSourceDescriptor>,
      pictureStyles: {
        boxShadow: 'rgb(36, 116, 204) 0px 0px 8px'
      }
    };
  }
});
</script>
