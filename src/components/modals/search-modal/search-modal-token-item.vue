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
        <picture>
          <source
            srcset="@/assets/images/info.webp, @/assets/images/info2x.webp 2x"
            type="image/webp"
          />
          <img
            :alt="$t('icon.txtTokenInfoAlt')"
            src="@/assets/images/info.png"
            srcset="@/assets/images/info.png, @/assets/images/info2x.png 2x"
          />
        </picture>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import BigNumber from 'bignumber.js';

import { isTokenWithBalance, Token, TokenWithBalance } from '@/wallet/types';
import { TokenImage } from '@/components/tokens';

export default Vue.extend({
  name: 'SearchModalTokenItem',
  components: {
    TokenImage
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
  computed: {
    assetBalance(): string {
      if (isTokenWithBalance(this.item)) {
        console.log(this.item);
        return new BigNumber(this.item.balance).decimalPlaces(18).toFormat();
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
