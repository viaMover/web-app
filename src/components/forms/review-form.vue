<template>
  <form class="review__wrapper">
    <secondary-page-simple-title
      class="page-title max-width"
      :title="headerTitle"
    />
    <div class="arrow">
      <div class="item">
        <slot name="first-token-image">
          <token-image
            :address="token.address"
            :src="token.logo"
            :symbol="token.symbol"
            wrapper-class="item-coin"
          />
        </slot>
      </div>
      <div class="item">
        <div class="item-arrow">
          <span />
          <span />
        </div>
      </div>
      <div class="item">
        <slot name="second-token-image">
          <custom-picture
            :alt="image ? image.alt : ''"
            class="shadow"
            :sources="image ? image.sources : []"
            :src="image ? image.src : ''"
            :webp-sources="image ? image.webpSources : []"
          />
        </slot>
      </div>
    </div>
    <div class="items">
      <div class="item">
        <h2>{{ inputAmountTitle }} {{ token.symbol }}</h2>
        <span>{{ formattedAmount }}</span>
      </div>
      <div class="item">
        <h2>{{ inputAmountNativeTitle }}</h2>
        <span>{{ formatNativeAmount }}</span>
      </div>
    </div>
    <div v-if="isSubsidizedEnabled">
      <div class="switch">
        <p>{{ $t('forms.lblUseSmartTreasury') }}</p>
        <div class="switch__container">
          <input
            id="switch-shadow"
            v-model="isSmartTreasury"
            hidden="hidden"
            type="checkbox"
          />
          <label class="switch-button" for="switch-shadow"></label>
        </div>
      </div>
      <div class="items">
        <div class="item">
          <h2>{{ $t('forms.lblEstimatedGasCost') }}</h2>
          <span>{{ formattedEstimatedGasCost }}</span>
        </div>
      </div>
    </div>
    <button
      class="button-active black-link"
      type="button"
      @click="handleCreateTx"
    >
      {{ buttonText }}
    </button>
  </form>
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
  name: 'ReviewForm',
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
    image: {
      type: Object as PropType<PictureDescriptor>,
      default: undefined
    },
    amount: {
      type: String,
      required: true
    },
    nativeAmount: {
      type: String,
      required: true
    },
    headerTitle: {
      type: String,
      default: ''
    },
    inputAmountTitle: {
      type: String,
      default: ''
    },
    inputAmountNativeTitle: {
      type: String,
      default: ''
    },
    buttonText: {
      type: String,
      default: ''
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
      isSmartTreasury: true
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
    handleCreateTx(): void {
      this.$emit('tx-start', {
        isSmartTreasury: this.isSmartTreasury && this.isSubsidizedEnabled
      });
    }
  }
});
</script>
