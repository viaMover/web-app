<template>
  <div class="swaps__wrapper-search-items-item" @click="handleSelect">
    <div class="swaps__wrapper-search-items-item-info">
      <token-image
        :address="item.address"
        :src="item.logo"
        :symbol="item.symbol"
        wrapper-class="icon"
      />
      <div class="info">
        <p>{{ item.name }}</p>
        <span>{{ item.symbol }}</span>
      </div>
    </div>
    <div v-if="showBalance" class="items__item-number">
      <p>{{ assetBalance }}</p>
    </div>
    <div
      v-else-if="hasInfoButton"
      class="swaps__wrapper-search-items-item-button"
    >
      <a class="button-active" :href="infoButtonSrc" target="_blank">
        <custom-picture
          :alt="$t('icon.txtTokenInfoAlt', { name: item.name })"
          :sources="pictureSources"
          :src="require('@/assets/images/info.png')"
          :webp-sources="pictureWebpSources"
        />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import BigNumber from 'bignumber.js';

import { isTokenWithBalance, Token, TokenWithBalance } from '@/wallet/types';

import { CustomPicture, PictureSourceDescriptor } from '@/components/html5';
import { TokenImage } from '@/components/tokens';

export default Vue.extend({
  name: 'SearchModalTokenItem',
  components: {
    TokenImage,
    CustomPicture
  },
  props: {
    item: {
      type: Object as PropType<Token | TokenWithBalance>,
      required: true
    },
    showBalance: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      pictureSources: [
        { src: require('@/assets/images/info.png') },
        { src: require('@/assets/images/info2x.png'), variant: '2x' }
      ],
      pictureWebpSources: [
        { src: require('@/assets/images/info.webp') },
        { src: require('@/assets/images/info2x.webp'), variant: '2x' }
      ] as Array<PictureSourceDescriptor>
    };
  },
  computed: {
    assetBalance(): string {
      if (isTokenWithBalance(this.item)) {
        return new BigNumber(this.item.balance).decimalPlaces(4).toFormat();
      }
      return '0';
    },
    hasInfoButton(): boolean {
      return this.item.symbol !== 'ETH';
    },
    infoButtonSrc(): string {
      return `https://etherscan.io/token/${this.item.address}`;
    }
  },
  methods: {
    handleSelect(): void {
      this.$emit('select', this.item);
    }
  }
});
</script>
