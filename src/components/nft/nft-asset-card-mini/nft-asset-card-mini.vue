<template>
  <div class="item__list-item">
    <router-link class="item__list-item" :to="routeTo">
      <custom-picture
        :alt="item.picture.alt"
        :sources="item.picture.sources"
        :src="item.picture.src"
        :webp-sources="item.picture.webpSources"
      />
      <h3>{{ item.name }}</h3>
    </router-link>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { RawLocation } from 'vue-router';

import { NftAsset } from '@/store/modules/nft/types';

import { CustomPicture } from '@/components/html5';

export default Vue.extend({
  name: 'NftAssetCardMini',
  components: { CustomPicture },
  props: {
    item: {
      type: Object as PropType<NftAsset>,
      required: true
    }
  },
  computed: {
    routeTo(): RawLocation {
      return {
        name: this.item.name.toLowerCase().replaceAll(' ', '-')
      };
    }
  }
});
</script>
