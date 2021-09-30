<template>
  <div class="review__wrapper">
    <secondary-page-simple-title
      class="savings_secondary_page-title"
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
        <span> {{ formatAmount }} </span>
      </div>
      <div v-if="!isSelectedUSDCToken" class="item">
        <h2>{{ $t('savings.deposit.lblAndTotalOf') }}</h2>
        <span>
          {{ formatNativeAmount }}
        </span>
      </div>
    </div>
    <div v-if="subsidizedEnabled">
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
          <span>{{ formatEstimatedGasCost }}</span>
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

import { SmallTokenInfoWithIcon, TokenWithBalance } from '@/wallet/types';
import { formatToDecimals, formatToNative } from '@/utils/format';

import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import TokenImage from '@/components/tokens/token-image/token-image.vue';
import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { getUSDCAssetData } from '@/wallet/references/data';
import { sameAddress } from '@/utils/address';

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
    subsidizedEnabled: {
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
    ...mapState('account', ['networkInfo']),
    formatAmount(): string {
      if (this.isSelectedUSDCToken) {
        return `${formatToNative(this.amount)} ${this.outputUSDCAsset.symbol}`;
      }
      return `${formatToDecimals(this.amount, 4)} ${this.token.symbol}`;
    },
    formatEstimatedGasCost(): string {
      if (this.isSmartTreasury) {
        return '$0.00';
      }
      if (this.estimatedGasCost === undefined) {
        return 'No data';
      }
      return `$${formatToNative(this.estimatedGasCost)}`;
    },
    formatNativeAmount(): string {
      return `${formatToNative(this.nativeAmount)} ${
        this.outputUSDCAsset.symbol
      }`;
    },
    outputUSDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    isSelectedUSDCToken(): boolean {
      return sameAddress(this.token.address, this.outputUSDCAsset.address);
    }
  },
  methods: {
    formatToDecimals,
    formatToNative,
    handleCreateTx(): void {
      this.$emit('tx-start', {
        isSmartTreasury: this.isSmartTreasury && this.subsidizedEnabled
      });
    }
  }
});
</script>
