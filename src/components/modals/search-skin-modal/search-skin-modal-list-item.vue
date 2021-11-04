<template>
  <div class="swaps__wrapper-search-items-item" @click="handleSelect">
    <div class="swaps__wrapper-search-items-item-info">
      <skin-image
        :id="item.id"
        :color="item.color"
        :src="item.previewPicture.src"
        :symbol="item.symbol"
        wrapper-class="icon"
      />
      <div class="info">
        <p>{{ item.name }}</p>
        <span>{{ item.symbol }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Skin } from '@/store/modules/debit-card/types';

import { SkinImage } from '@/components/tokens';

export default Vue.extend({
  name: 'SearchSkinModalListItem',
  components: {
    SkinImage
  },
  props: {
    item: {
      type: Object as PropType<Skin>,
      required: true
    },
    showBalance: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleSelect(): void {
      this.$emit('select', this.item);
    }
  }
});
</script>
