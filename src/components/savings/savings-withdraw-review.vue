<template>
  <div class="review__wrapper">
    <secondary-page-simple-title
      class="page-title max-width"
      :title="$t('savings.withdraw.lblReviewYourWithdraw')"
    />
    <div class="arrow">
      <div class="item">
        <custom-picture
          :alt="savingsImages.alt"
          class="shadow"
          :sources="savingsImages.sources"
          :src="savingsImages.src"
          :webp-sources="savingsImages.webpSources"
        />
      </div>
      <div class="item">
        <div class="item-arrow">
          <span />
          <span />
        </div>
      </div>
      <div class="item">
        <token-image
          :address="token.address"
          :src="token.logo"
          :symbol="token.symbol"
          wrapper-class="item-coin"
        />
      </div>
    </div>
    <div class="items">
      <div class="item">
        <h2>
          {{ $t('savings.withdraw.lblAmountWeWithdrawIn') }}
          {{ token.symbol }}
        </h2>
        <span> {{ formatToNative(amount) }} {{ $t('savings.USDC') }} </span>
      </div>
      <div class="item">
        <h2>{{ $t('savings.withdraw.lblAndTotalOf') }}</h2>
        <span> {{ formatToNative(amount) }} {{ $t('savings.USDC') }} </span>
      </div>
    </div>
    <div v-if="isSubsidizedEnabled">
      <div class="switch">
        <p>{{ $t('savings.withdraw.lblUseSmartTreasury') }}</p>
        <form class="switch__container">
          <input
            id="switch-shadow"
            v-model="isSmartTreasury"
            hidden="hidden"
            type="checkbox"
          />
          <label class="switch-button" for="switch-shadow"></label>
        </form>
      </div>
      <div class="items">
        <div class="item">
          <h2>{{ $t('savings.withdraw.lblEstimatedGasCost') }}</h2>
          <span>{{ formattedEstimatedGasCost }}</span>
        </div>
      </div>
    </div>
    <button
      class="button-active black-link"
      type="button"
      @click="handleCreateTx"
    >
      {{ $t('savings.withdraw.lblWithdrawFromSavings') }}
    </button>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { formatToDecimals, formatToNative } from '@/utils/format';
import { TokenWithBalance } from '@/wallet/types';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import TokenImage from '@/components/tokens/token-image/token-image.vue';

export default Vue.extend({
  name: 'SavingsWithdrawReview',
  components: {
    TokenImage,
    SecondaryPageSimpleTitle,
    CustomPicture
  },
  props: {
    token: {
      type: Object as PropType<TokenWithBalance>,
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    isSubsidizedEnabled: {
      type: Boolean,
      default: false
    },
    estimatedGasCost: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      isSmartTreasury: true,
      savingsImages: {
        alt: '',
        src: require('@/assets/images/Savings@1x.png'),
        sources: [
          { src: require('@/assets/images/Savings@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Savings@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/Savings@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/Savings@2x.webp')
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    formattedEstimatedGasCost(): string {
      if (this.isSmartTreasury) {
        return '$0.00';
      }
      if (this.estimatedGasCost === undefined) {
        return this.$t('lblNoData') as string;
      }
      return `$${formatToNative(this.estimatedGasCost)}`;
    }
  },
  methods: {
    formatToDecimals,
    formatToNative,
    handleCreateTx(): void {
      this.$emit('tx-start', {
        isSmartTreasury: this.isSmartTreasury
      });
    }
  }
});
</script>
