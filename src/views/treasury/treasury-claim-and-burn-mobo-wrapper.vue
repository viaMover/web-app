<template>
  <secondary-page :has-back-button="hasBackButton" @back="handleBack">
    <prepare-form
      v-if="step === 'prepare'"
      allow-zero-amount
      :asset="inputAsset"
      :header-description="$t('treasury.claimAndBurnMOBO.txtPageDescription')"
      :header-title="$t('treasury.claimAndBurnMOBO.lblClaimAndBurn')"
      :input-amount="inputAmount"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('treasury.claimAndBurnMOBO.lblWhatDoWeBurn')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :operation-description="
        $t('treasury.claimAndBurnMOBO.txtYouApproximateExit')
      "
      :operation-title="claimingForStr"
      :output-asset-heading-text="
        $t('treasury.claimAndBurnMOBO.lblAmountWeBurnIn')
      "
      :selected-token-description="description"
      :transfer-error="transferError"
      @review-tx="handleTxReview"
      @toggle-input-mode="handleToggleInputMode"
    >
      <template v-slot:input>
        <input disabled type="text" :value="value" />
      </template>
    </prepare-form>
    <review-form
      v-else-if="step === 'review'"
      :amount="inputAmount"
      :button-text="$t('treasury.claimAndBurnMOBO.btnClaimAndBurnWithAssets')"
      :header-title="$t('treasury.claimAndBurnMOBO.lblReviewYourClaim')"
      :input-amount-native-title="$t('treasury.claimAndBurnMOBO.lblAndTotalOf')"
      :input-amount-title="$t('treasury.claimAndBurnMOBO.lblAmountWeBurnIn')"
      :native-amount="formattedNativeAmount"
      :token="inputAsset"
      @tx-start="handleTxStart"
    >
      <template v-slot:first-token-image>
        <custom-picture
          :alt="treasury.alt"
          class="shadow"
          :sources="treasury.sources"
          :src="treasury.src"
          :webp-sources="treasury.webpSources"
        />
      </template>
      <template v-slot:second-token-image>
        <token-image
          :address="usdcTokenInfo.address"
          :src="usdcTokenInfo.iconURL"
          :symbol="usdcTokenInfo.symbol"
          wrapper-class="item-coin"
        />
      </template>
    </review-form>
    <loader-form v-else-if="step === 'loader'" :step="transactionStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';
import BigNumber from 'bignumber.js';

import { sendGlobalTopMessageEvent } from '@/global-event-bus';
import { SmartTreasuryOnChainService } from '@/services/v2/on-chain/mover/smart-treasury';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { convertNativeAmountFromAmount, notZero } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';
import { getMoboAssetData, getUSDCAssetData } from '@/wallet/references/data';
import { SmallTokenInfoWithIcon, TokenWithBalance } from '@/wallet/types';

import {
  InputMode,
  LoaderForm,
  LoaderStep,
  PrepareForm,
  ReviewForm
} from '@/components/forms';
import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { SecondaryPage } from '@/components/layout/secondary-page';
import { TokenImage } from '@/components/tokens';

type ProcessStep = 'prepare' | 'review' | 'loader';

export default Vue.extend({
  name: 'TreasuryClaimAndBurnMoboWrapper',
  components: {
    TokenImage,
    CustomPicture,
    PrepareForm,
    ReviewForm,
    LoaderForm,
    SecondaryPage
  },
  mixins: [GasListenerMixin],
  data() {
    return {
      //current
      step: 'prepare' as ProcessStep,
      transactionStep: undefined as LoaderStep | undefined,
      treasury: {
        alt: this.$t('treasury.lblSmartTreasury') as string,
        src: 'https://storage.googleapis.com/mover-webapp-assets/images/SmartTreasury@1x.png',
        sources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/SmartTreasury@1x.png'
          },
          {
            variant: '2x',
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/SmartTreasury@2x.png'
          }
        ],
        webpSources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/SmartTreasury@1x.webp'
          },
          {
            variant: '2x',
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/SmartTreasury@2x.webp'
          }
        ]
      } as PictureDescriptor,

      //prepare-form
      inputMode: 'TOKEN' as InputMode,
      inputAmount: '',
      inputAmountNative: '',
      transferError: undefined as undefined | string,
      isLoading: false,
      isProcessing: false,
      isTokenSelectedByUser: false,

      //to tx
      actionGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo',
      tokens: 'tokens',
      currentAddress: 'currentAddress',
      provider: 'provider',
      nativeCurrency: 'nativeCurrency'
    }),
    ...mapGetters('account', {
      usdcNativePrice: 'usdcNativePrice',
      getTokenColor: 'getTokenColor'
    }),
    ...mapState('treasury', {
      treasuryBonus: 'treasuryBonus',
      smartTreasuryOnChainService: 'onChainService'
    }),
    inputAsset(): TokenWithBalance {
      return {
        address: this.moboTokenInfo.address,
        decimals: this.moboTokenInfo.decimals,
        symbol: this.moboTokenInfo.symbol,
        name: 'MOBO',
        priceUSD: this.usdcNativePrice,
        logo: this.moboTokenInfo.iconURL,
        balance: this.treasuryBonus ?? '0',
        marketCap: Number.MAX_SAFE_INTEGER
      };
    },
    hasBackButton(): boolean {
      return this.step !== 'loader';
    },
    moboTokenInfo(): SmallTokenInfoWithIcon {
      return getMoboAssetData(this.networkInfo.network);
    },
    usdcTokenInfo(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    claimingForStr(): string {
      if (this.inputAmountNative === '') {
        return '~ $0.00';
      }
      return `~ $${formatToNative(this.inputAmountNative)}`;
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    formattedNativeAmount(): string {
      return `${formatToNative(this.inputAmountNative)} ${
        this.nativeCurrencySymbol
      }`;
    },
    value(): string {
      if (this.inputMode === 'TOKEN') {
        return `${this.inputAmount} ${this.inputAsset.symbol}`;
      }

      return `${this.inputAmountNative} ${this.nativeCurrencySymbol}`;
    },
    description(): string {
      return this.$t('treasury.claimAndBurnMOBO.txtYouChooseMOBO') as string;
    }
  },
  beforeMount() {
    this.inputAmount = this.inputAsset.balance;
    this.inputAmountNative = new BigNumber(
      convertNativeAmountFromAmount(
        this.inputAsset.balance,
        this.inputAsset.priceUSD
      )
    ).toFixed(2);

    if (!notZero(this.inputAmount)) {
      this.transferError = this.$t(
        'treasury.claimAndBurnMOBO.lblDontHaveMOBO'
      ) as string;
    }
  },
  methods: {
    ...mapActions('account', {
      updateWalletAfterTxn: 'updateWalletAfterTxn'
    }),
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
    handleBack(): void {
      if (this.step === 'review') {
        this.step = 'prepare';
      } else {
        this.$router.replace({
          name: 'treasury-manage'
        });
      }
    },
    handleToggleInputMode(): void {
      if (this.inputMode === 'NATIVE') {
        this.inputMode = 'TOKEN';
        return;
      }
      this.inputMode = 'NATIVE';
    },
    async handleTxReview(): Promise<void> {
      this.isProcessing = true;
      try {
        const gasLimits = await (
          this.smartTreasuryOnChainService as SmartTreasuryOnChainService
        ).estimateClaimAndBurnMOBO();

        this.actionGasLimit = gasLimits.actionGasLimit;
        this.step = 'review';
      } catch (error) {
        sendGlobalTopMessageEvent(
          this.$t('errors.estimationFailed') as string,
          'error'
        );
        console.error('failed to handle transaction review', error);
        Sentry.captureException(error);
      } finally {
        this.isProcessing = false;
      }
    },
    async handleTxStart(): Promise<void> {
      if (this.inputAmount === '') {
        console.error('inputAmount is empty during `handleTxStart`');
        addSentryBreadcrumb({
          type: 'error',
          category: 'treasury.claim-and-burn-mobo.handleTxStart',
          message: 'inputAmount is empty during `handleTxStart`'
        });
        Sentry.captureException("can't start treasury claim and burn MOBO TX");
        return;
      }

      if (this.actionGasLimit === undefined) {
        console.error('action gas limit is empty during `handleTxStart`');
        addSentryBreadcrumb({
          type: 'error',
          category: 'treasury.claim-and-burn-mobo.handleTxStart',
          message: 'action gas limit is empty during `handleTxStart`'
        });
        Sentry.captureException("can't start treasury claim and burn MOBO TX");
        return;
      }

      addSentryBreadcrumb({
        type: 'debug',
        category: 'treasury.claim-and-burn-mobo.handleTxStart',
        data: {
          inputAsset: this.inputAsset,
          inputAmount: this.inputAmount,
          network: this.networkInfo.network,
          currentAddress: this.currentAddress,
          actionGasLimit: this.actionGasLimit
        }
      });

      this.step = 'loader';
      this.transactionStep = 'Confirm';
      try {
        await (
          this.smartTreasuryOnChainService as SmartTreasuryOnChainService
        ).claimAndBurnMOBO(this.actionGasLimit, async () => {
          this.transactionStep = 'Process';
        });
        this.transactionStep = 'Success';
        this.updateWalletAfterTxn();
      } catch (error) {
        this.transactionStep = 'Reverted';
        console.log('Failed to claim & burn MOBO', error);
        Sentry.captureException(error);
      }
    }
  }
});
</script>
