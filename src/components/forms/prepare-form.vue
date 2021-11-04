<template>
  <div>
    <div>
      <secondary-page-simple-title
        class="page-title max-width"
        :description="headerDescription"
        :title="headerTitle"
      />
      <div class="secondary_page-token-info">
        <span>{{ tokenInfoTitle }}</span>
        <p>{{ tokenInfoDescription }}</p>
      </div>
    </div>
    <div class="secondary_page-body">
      <h2>{{ inputAssetHeading }}</h2>
      <div class="info">
        <PuSkeleton v-if="isLoading" class="icon" tag="div" />
        <token-image
          v-else
          :address="asset ? asset.address : ''"
          :src="asset ? asset.logo : ''"
          :symbol="asset ? asset.symbol : ''"
          wrapper-class="icon"
        />
        <div class="coin">
          <p>
            {{ asset ? asset.name : $t('forms.lblChooseToken') }}
            <span>
              {{ asset ? asset.symbol : '' }}
            </span>
          </p>
        </div>
        <button
          class="button-active button-arrow"
          :style="selectorStyle"
          type="button"
          @click.stop.prevent="handleOpenSelectModal"
        >
          <arrow-down-icon :stroke="asset ? '#fff' : '#000'" />
        </button>
      </div>
      <div class="available">
        <p>
          {{ $t('forms.lblAvailable') }}
          <span @click="handleSelectMaxAmount">{{ formattedMaxAmount }}</span>
        </p>
      </div>
      <div class="description">
        <p>
          {{ selectedTokenDescription }}
        </p>
      </div>
      <div class="form">
        <p>
          {{ outputAssetHeadingText }}
          <span class="form-button" @click="handleToggleInputMode">
            {{ currentInputSymbol }}
          </span>
        </p>
        <dynamic-input
          :disabled="isLoading"
          input-class="deposit__form-input eth-input"
          name="text"
          placeholder="0.00"
          :symbol="currentInputSymbol"
          type="text"
          :value="inputValue"
          @update-value="handleUpdateValue"
        />
        <div
          v-if="isSwapNeeded && formattedUsdcTotal && inputMode === 'TOKEN'"
          class="form-swap"
        >
          <p>
            {{ $t('forms.lblSwappingFor') }}
            <custom-picture
              alt="USDC"
              class="token"
              :sources="usdcPicture.sources"
              :src="usdcPicture.src"
            />
            <span>{{ formattedUsdcTotal }}</span>
          </p>
        </div>
        <action-button
          button-class="black-link button-active"
          :disabled="!isButtonActive"
          @button-click="handleReviewTx"
        >
          <div v-if="isLoading || isProcessing" class="loader-icon">
            <img
              :alt="$t('icon.txtPendingIconAlt')"
              src="@/assets/images/ios-spinner-white.svg"
            />
          </div>
          <template v-else>
            {{ isButtonActive ? $t('forms.lblReviewTransaction') : error }}
          </template>
        </action-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapGetters, mapState } from 'vuex';

import BigNumber from 'bignumber.js';
import { Properties as CssProperties } from 'csstype';

import { sameAddress } from '@/utils/address';
import { greaterThan, multiply, notZero } from '@/utils/bigmath';
import { formatToDecimals } from '@/utils/format';
import { getUSDCAssetData } from '@/wallet/references/data';
import { SmallTokenInfoWithIcon, TokenWithBalance } from '@/wallet/types';

import { ActionButton } from '@/components/buttons';
import { ArrowDownIcon, DynamicInput } from '@/components/controls';
import { INPUT_MODE } from '@/components/forms/types';
import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { SecondaryPageSimpleTitle } from '@/components/layout/secondary-page';
import { TokenImage } from '@/components/tokens';

export default Vue.extend({
  name: 'PrepareForm',
  components: {
    TokenImage,
    SecondaryPageSimpleTitle,
    ActionButton,
    ArrowDownIcon,
    DynamicInput,
    CustomPicture
  },
  props: {
    isLoading: {
      type: Boolean,
      required: true
    },
    isProcessing: {
      type: Boolean,
      required: true
    },
    asset: {
      type: Object as PropType<TokenWithBalance>,
      default: undefined
    },
    headerTitle: {
      type: String,
      default: ''
    },
    headerDescription: {
      type: String,
      default: ''
    },
    tokenInfoTitle: {
      type: String,
      default: ''
    },
    tokenInfoDescription: {
      type: String,
      default: ''
    },
    selectedTokenDescription: {
      type: String,
      default: ''
    },
    inputMode: {
      type: String as PropType<INPUT_MODE>,
      required: true
    },
    inputAssetHeading: {
      type: String,
      default: ''
    },
    inputAmount: {
      type: String,
      required: true
    },
    inputAmountNative: {
      type: String,
      required: true
    },
    transferError: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    formattedUsdcTotal: {
      type: String,
      default: undefined
    },
    outputAssetHeadingText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      usdcPicture: {
        src: require('@/assets/images/USDC.png'),
        sources: [
          {
            src: require('@/assets/images/USDC@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('account', ['networkInfo', 'nativeCurrency']),
    ...mapGetters('account', ['getTokenColor']),
    outputUSDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    maxInputAmount(): string {
      if (this.asset === undefined) {
        return '0';
      }
      return this.asset.balance;
    },
    inputValue(): string {
      return this.inputMode === 'TOKEN'
        ? this.inputAmount
        : this.inputAmountNative;
    },
    currentInputSymbol(): string {
      if (this.inputMode === 'TOKEN') {
        return this.asset?.symbol ?? '';
      } else {
        return this.nativeCurrencySymbol;
      }
    },
    error(): string | undefined {
      if (this.asset === undefined) {
        return this.$t('forms.lblChooseToken') as string;
      }
      if (!notZero(this.inputAmount)) {
        return this.$t('forms.lblChooseAmount') as string;
      }
      if (greaterThan(this.inputAmount, this.asset?.balance ?? 0)) {
        return this.$t('lblInsufficientBalance') as string;
      }
      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    },
    isButtonActive(): boolean {
      return this.error === undefined && !this.isLoading;
    },
    formattedMaxAmount(): string {
      if (this.asset === undefined) {
        return `0`;
      }

      if (this.inputMode === 'TOKEN') {
        return `${formatToDecimals(this.asset.balance, 4)} ${
          this.asset.symbol
        }`;
      } else {
        return `$${formatToDecimals(
          multiply(this.asset.balance, this.asset.priceUSD),
          2
        )} ${this.nativeCurrencySymbol}`;
      }
    },
    selectorStyle(): CssProperties {
      if (this.asset === undefined) {
        return {
          backgroundColor: '#f1f1f1',
          boxShadow: '0 0 8px rgb(0, 0, 0, 0.5)'
        };
      }
      const assetColor = this.getTokenColor(this.asset.address);
      return {
        backgroundColor: assetColor,
        boxShadow: `0 0 8px ${assetColor}`
      };
    },
    isSwapNeeded(): boolean {
      if (this.asset === undefined) {
        return true;
      }

      return !sameAddress(this.asset.address, this.outputUSDCAsset.address);
    }
  },
  methods: {
    handleOpenSelectModal() {
      this.$emit('open-select-modal');
    },
    handleSelectMaxAmount() {
      this.$emit('select-max-amount');
    },
    handleToggleInputMode(): void {
      this.$emit('toggle-input-mode');
    },
    handleUpdateValue(val: string): void {
      this.$emit('update-amount', val);
    },
    handleReviewTx(): void {
      this.$emit('review-tx');
    }
  }
});
</script>
