<template>
  <div class="review__wrapper">
    <secondary-page-simple-title
      class="deposit_in_savings-title"
      :title="$t('savings.deposit.lblDepositInSavings')"
    />
    <div class="arrow">
      <div class="item">
        <token-image
          :address="selectedToken.address"
          :src="selectedToken.logo"
          :symbol="selectedToken.symbol"
          wrapper-class="icon"
        />
      </div>
      <div class="item">
        <div class="item-arrow">
          <span />
          <span />
        </div>
      </div>
      <div class="item">
        <custom-picture
          :alt="savings.alt"
          :sources="savings.sources"
          :src="savings.src"
          :webp-sources="savings.webpSources"
        />
      </div>
    </div>
    <div class="items">
      <div class="item">
        <h2>Amount we deposit in ETH</h2>
        <span>0.1793 ETH</span>
      </div>
      <div class="item">
        <h2>And it will be a total of</h2>
        <span>1,294.11 USDC</span>
      </div>
    </div>
    <div class="switch">
      <p>Use Smart Treasury rewards to cover gas</p>
      <form action="#" class="switch__container">
        <input id="switch-shadow" hidden="hidden" type="checkbox" />
        <label class="switch" for="switch-shadow"></label>
      </form>
    </div>
    <div class="review__wrapper-items">
      <div class="item">
        <h2>Estimated gas cost</h2>
        <span>$0.00</span>
      </div>
    </div>
    <button class="button-active black-link" type="button">
      Deposit in Savings
    </button>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { TokenWithBalance } from '@/wallet/types';
import { formatToNative } from '@/utils/format';
import {
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount
} from '@/utils/bigmath';

import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import TokenImage from '@/components/tokens/token-image/token-image.vue';
import { CustomPicture, PictureDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'SavingsDepositReview',
  components: {
    TokenImage,
    SecondaryPageSimpleTitle,
    CustomPicture
  },
  props: {
    selectedToken: {
      type: Object as PropType<TokenWithBalance>,
      required: true
    },
    inputAmount: {
      type: String,
      required: true
    },
    amountType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
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
      return this.selectedToken.name === 'USDc';
    },
    isButtonActive(): boolean {
      return true;
    },
    formattedNativeTotal(): string {
      const native = convertNativeAmountFromAmount(
        this.inputAmount,
        this.selectedToken.priceUSD
      );

      return `${formatToNative(native)} USDC`;
    }
  }
});
</script>
