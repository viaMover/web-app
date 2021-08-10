<template>
  <li
    v-if="item"
    class="nibble-shop__wrapper-info-items-item"
    :style="componentStyle"
  >
    <div class="nibble-shop__wrapper-info-items-item-content">
      <h3>{{ item.title }}</h3>
      <p>{{ item.edition }}</p>
    </div>
    <div class="nibble-shop__wrapper-info-items-item-info">
      <p>{{ item.availableQuantity }}/{{ item.initialQuantity }} available</p>
      <span>{{ item.price }}</span>
    </div>
    <router-link class="button button-primary button-active" :to="routeTo">
      {{ $t('nibbleShop.btnGet.simple') }}
    </router-link>
  </li>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapState } from 'vuex';
import { RawLocation } from 'vue-router';
import { Properties } from 'csstype';

import { Asset } from '@/store/modules/shop/types';

export default Vue.extend({
  name: 'NibbleShopProduct',
  props: {
    item: {
      type: Object as PropType<Asset>,
      required: true
    }
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
    routeTo(): RawLocation {
      return {
        name: 'nibble-shop-view',
        params: { id: this.item.id }
      };
    },
    componentStyle(): Properties {
      return {
        background: `url(${this.item.imageSrc}) no-repeat center ${this.item.imageScaleH}`,
        backgroundColor: this.item.background,
        backgroundSize: this.item.imageSize
      };
    }
  }
});
</script>
