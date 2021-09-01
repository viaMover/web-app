<template>
  <li class="nft-drops__wrapper__menu-info-items-item" :style="componentStyle">
    <div class="nft-drops__wrapper__menu-info-items-item-content">
      <h3 :style="titleStyle">
        {{ item.name }}
      </h3>
      <p :style="textStyle">
        {{ item.description }}
      </p>
    </div>
    <router-link
      class="button-active"
      :class="[buttonClass]"
      :style="btnStyle"
      :to="routeTo"
    >
      {{ $t('NFTs.btnGet.simple') }}
    </router-link>
  </li>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { RawLocation } from 'vue-router';
import { Properties } from 'csstype';
export default Vue.extend({
  name: 'NftAssetCard',
  props: {
    buttonClass: {
      type: String,
      default: 'button-primary'
    }
  },
  computed: {}
});
</script>
