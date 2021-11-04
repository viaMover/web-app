<template>
  <div class="card-image">
    <custom-picture
      :alt="skin.picture.alt"
      :sources="skin.picture.sources"
      :src="skin.picture.src"
      :webp-sources="skin.picture.webpSources"
    />
  </div>
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
    }
  }
});
</script>
