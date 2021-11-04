<template>
  <div class="review__wrapper">
    <secondary-page-simple-title
      class="page-title max-width"
      :title="$t('savings.deposit.lblReviewYourDeposit')"
    />
    <div class="arrow">
      <div class="item">
        <token-image
          :address="token.address"
          :src="token.logo"
          :symbol="token.symbol"
          wrapper-class="item-coin"
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
          class="shadow"
          :sources="savings.sources"
          :src="savings.src"
          :webp-sources="savings.webpSources"
        />
      </div>
    </div>
    <div class="items">
      <div class="item">
        <h2>
          {{ $t('savings.deposit.lblAmountWeDepositIn') }}
          {{ token.symbol }}
        </h2>
        <span> {{ formattedAmount }} </span>
      </div>
      <div class="item">
        <h2>{{ $t('savings.deposit.lblAndTotalOf') }}</h2>
        <span>
          {{ formatNativeAmount }}
        </span>
      </div>
    </div>
    <div v-if="isSubsidizedEnabled">
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
          <span>{{ formattedEstimatedGasCost }}</span>
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
import { mapState } from 'vuex';

import { formatToDecimals, formatToNative } from '@/utils/format';
import { TokenWithBalance } from '@/wallet/types';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import { TokenImage } from '@/components/tokens';

export default Vue.extend({
  name: 'SavingsDepositReview',
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
    nativeAmount: {
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
    ...mapState('account', ['networkInfo', 'nativeCurrency']),
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    formattedAmount(): string {
      return `${formatToDecimals(this.amount, 4)} ${this.token.symbol}`;
    },
    formattedEstimatedGasCost(): string {
      if (this.isSmartTreasury) {
        return '$0.00';
      }
      if (this.estimatedGasCost === undefined) {
        return this.$t('lblNoData') as string;
      }
      return `$${formatToNative(this.estimatedGasCost)}`;
    },
    formatNativeAmount(): string {
      return `${formatToNative(this.nativeAmount)} ${
        this.nativeCurrencySymbol
      }`;
    }
  },
  methods: {
    formatToDecimals,
    formatToNative,
    handleCreateTx(): void {
      this.$emit('tx-start', {
        isSmartTreasury: this.isSmartTreasury && this.isSubsidizedEnabled
      });
    }
  }
});
</script>
