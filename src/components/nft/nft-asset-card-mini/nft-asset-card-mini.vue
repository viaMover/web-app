<template>
  <router-link class="button-like item" :to="routeTo">
    <custom-picture
      :alt="$t('NFTs.txtAssetAlt', { name: item.name })"
      :sources="item.picture.sources"
      :src="item.picture.src"
      :webp-sources="item.picture.webpSources"
    />
    <h3 class="title">{{ item.name }}</h3>
  </router-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { RawLocation } from 'vue-router';

import { BaseNftAsset } from '@/store/modules/nft/types';

import { CustomPicture } from '@/components/html5';

export default Vue.extend({
  name: 'NftAssetCardMini',
  components: { CustomPicture },
  props: {
    item: {
      type: Object as PropType<BaseNftAsset>,
      required: true
    }
  },
  computed: {
    routeTo(): RawLocation {
      return {
        name: this.item.id
      };
    }
  }
});
</script>
