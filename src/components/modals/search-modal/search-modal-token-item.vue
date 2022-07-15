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
          :src="'https://storage.googleapis.com/mover-webapp-assets/images/info.png'"
          :webp-sources="pictureWebpSources"
        />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapState } from 'vuex';

import BigNumber from 'bignumber.js';

import { isBaseAsset } from '@/utils/address';
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
        {
          src: 'https://storage.googleapis.com/mover-webapp-assets/images/info.png'
        },
        {
          src: 'https://storage.googleapis.com/mover-webapp-assets/images/info2x.png',
          variant: '2x'
        }
      ],
      pictureWebpSources: [
        {
          src: 'https://storage.googleapis.com/mover-webapp-assets/images/info.webp'
        },
        {
          src: 'https://storage.googleapis.com/mover-webapp-assets/images/info2x.webp',
          variant: '2x'
        }
      ] as Array<PictureSourceDescriptor>
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo'
    }),
    assetBalance(): string {
      if (isTokenWithBalance(this.item)) {
        return new BigNumber(this.item.balance).decimalPlaces(4).toFormat();
      }
      return '0';
    },
    hasInfoButton(): boolean {
      return !isBaseAsset(this.item.address, this.currentNetwork);
    },
    infoButtonSrc(): string {
      return `${this.networkInfo.explorer}/token/${this.item.address}`;
    }
  },
  methods: {
    handleSelect(): void {
      this.$emit('select', this.item);
    }
  }
});
</script>
