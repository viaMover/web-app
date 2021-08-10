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

import { NFT } from '@/store/modules/nft/types';

export default Vue.extend({
  name: 'NftAssetCard',
  props: {
    item: {
      type: Object as PropType<NFT>,
      required: true
    },
    buttonClass: {
      type: String,
      default: 'button-primary'
    }
  },
  computed: {
    componentStyle(): Properties {
      return {
        background: `url(${this.item.imageSrc}) no-repeat ${this.item.imageScaleH} ${this.item.imageScaleV}`,
        backgroundColor: this.item.background,
        backgroundSize: this.item.imageSize
      };
    },
    titleStyle(): Properties {
      return {
        color: this.item.titleColor
      };
    },
    textStyle(): Properties {
      return {
        color: this.item.textColor
      };
    },
    btnStyle(): Properties {
      return {
        color: this.item.btnTextColor,
        backgroundColor: this.item.btnBackgroundColor
      };
    },
    routeTo(): RawLocation {
      return {
        name: 'nft-view',
        params: { id: this.item.id }
      };
    }
  }
});
</script>
