<template>
  <div class="review__wrapper">
    <secondary-page-simple-title
      class="savings_secondary_page-title"
      :title="$t('savings.deposit.lblReviewYourDeposit')"
    />
    <div class="arrow">
      <div class="item">
        <custom-picture
          :alt="savings.alt"
          class="shadow"
          :sources="savings.sources"
          :src="savings.src"
          :webp-sources="savings.webpSources"
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
          {{ $t('savings.deposit.lblAmountWeDepositIn') }}
          {{ token.symbol }}
        </h2>
        <span> {{ formatToNative(amount) }} {{ $t('savings.USDC') }} </span>
      </div>
      <div class="item">
        <h2>{{ $t('savings.deposit.lblAndTotalOf') }}</h2>
        <span> {{ formatToNative(amount) }} {{ $t('savings.USDC') }} </span>
      </div>
    </div>
    <div v-if="isSubsidy">
      <div class="switch">
        <p>{{ $t('savings.deposit.lblUseSmartTreasury') }}</p>
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
          <h2>{{ $t('savings.deposit.lblEstimatedGasCost') }}</h2>
          <span>{{ gasCost }}</span>
        </div>
      </div>
    </div>
    <button
      class="button-active black-link"
      type="button"
      @click="handleCreateTx"
    >
      {{ $t('savings.deposit.lblDepositInSavings') }}
    </button>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { TokenWithBalance } from '@/wallet/types';
import { formatToDecimals, formatToNative } from '@/utils/format';

import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import TokenImage from '@/components/tokens/token-image/token-image.vue';
import { CustomPicture, PictureDescriptor } from '@/components/html5';

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
    }
  },
  data() {
    return {
      isSmartTreasury: true as boolean,
      savings: {
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
    isSelectedUSDCToken(): boolean {
      //TODO find some best way
      return this.token.name === 'USDc';
    },
    isSubsidy(): boolean {
      //TODO
      return true;
    },
    gasCost(): string {
      //TODO
      if (this.isSmartTreasury) {
        return '$0.00';
      } else {
        return '$123.02';
      }
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
