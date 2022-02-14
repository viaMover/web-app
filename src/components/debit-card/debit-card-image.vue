<template>
  <pu-skeleton class="card-image" :loading="isLoading" tag="div">
    <custom-picture
      :alt="skin.picture.alt"
      :sources="skin.picture.sources"
      :src="skin.picture.src"
      :webp-sources="skin.picture.webpSources"
    />
  </pu-skeleton>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Skin } from '@/store/modules/debit-card/types';

import { CustomPicture } from '@/components/html5';

export default Vue.extend({
  name: 'DebitCardImage',
  components: {
    CustomPicture
  },
  props: {
    skin: {
      type: Object as PropType<Skin>,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  }
});
</script>
