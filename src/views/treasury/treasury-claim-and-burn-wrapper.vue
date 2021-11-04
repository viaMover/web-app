<template>
  <secondary-page
    :has-back-button="hasBackButton"
    hide-title
    @back="handleBack"
  >
    <prepare-form
      v-if="!isShowReview"
      :asset="inputAsset"
      :header-description="
        $t('treasury.claimAndBurn.txtClaimAndBurnPageDescription')
      "
      :header-title="$t('treasury.claimAndBurn.lblClaimAndBurn')"
      :input-amount="inputAmount"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('treasury.claimAndBurn.lblWhatDoWeBurn')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :output-asset-heading-text="$t('treasury.claimAndBurn.lblAmountWeBurnIn')"
      :selected-token-description="description"
      :token-info-description="
        $t('treasury.claimAndBurn.txtYouApproximateExit')
      "
      :token-info-title="claimingForStr"
      :transfer-error="transferError"
      @open-select-modal="handleOpenSelectModal"
      @review-tx="handleTxReview"
      @select-max-amount="handleSelectMaxAmount"
      @toggle-input-mode="handleToggleInputMode"
      @update-amount="handleUpdateAmount"
    />
    <review-form
      v-else-if="txStep === undefined"
      :amount="inputAmount"
      :button-text="
        $t('treasury.decreaseBoost.btnDecreaseBoostInSmartTreasury')
      "
      :header-title="$t('treasury.decreaseBoost.lblReviewYourDecrease')"
      :image="treasury"
      :input-amount-native-title="$t('treasury.decreaseBoost.lblAndTotalOf')"
      :input-amount-title="$t('treasury.decreaseBoost.lblAmountWeRemoveIn')"
      :is-subsidized-enabled="isSubsidizedEnabled"
      :native-amount="inputAmountNative"
      :token="inputAsset"
      @tx-start="handleTxStart"
    />
    <full-page-form-loader v-else :step="txStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';
import BigNumber from 'bignumber.js';

import { getExitingAmount, getMaxBurn } from '@/services/chain';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { sameAddress } from '@/utils/address';
import {
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  greaterThan,
  multiply
} from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { claimAndBurnCompound } from '@/wallet/actions/treasury/claimAndBurn/claimAndBurn';
import { estimateClaimAndBurnCompound } from '@/wallet/actions/treasury/claimAndBurn/claimAndBurnEstimate';
import { CompoundEstimateResponse } from '@/wallet/actions/types';
import { getMoveAssetData } from '@/wallet/references/data';
import {
  SmallToken,
  SmallTokenInfoWithIcon,
  TokenWithBalance
} from '@/wallet/types';

import { Step } from '@/components/controls/full-page-form-loader';
import { FullPageFormLoader } from '@/components/controls/full-page-form-loader';
import PrepareForm from '@/components/forms/prepare-form.vue';
import ReviewForm from '@/components/forms/review-form.vue';
import { INPUT_MODE } from '@/components/forms/types';
import { PictureDescriptor } from '@/components/html5';
import { SecondaryPage } from '@/components/layout/secondary-page';

export default Vue.extend({
  name: 'TreasuryClaimAndBurnWrapper',
  components: {
    PrepareForm,
    ReviewForm,
    FullPageFormLoader,
    SecondaryPage
  },
  data() {
    return {
      //current
      isShowReview: false,
      txStep: undefined as Step | undefined,
      treasury: {
        alt: this.$t('treasury.lblSmartTreasury'),
        src: require('@/assets/images/SmartTreasury@1x.png'),
        sources: [
          { src: require('@/assets/images/SmartTreasury@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/SmartTreasury@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/SmartTreasury@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/SmartTreasury@2x.webp')
          }
        ]
      } as PictureDescriptor,

      //prepare-form
      inputMode: 'TOKEN' as INPUT_MODE,
      inputAsset: undefined as TokenWithBalance | undefined,
      inputAmount: '',
      inputAmountNative: '',
      claimingFor: '0',
      maxBurnedAmount: undefined as undefined | string,
      transferError: undefined as undefined | string,
      isLoading: true,
      isProcessing: false,
      isTokenSelectedByUser: false,

      //to tx
      isSubsidizedEnabled: false,
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', [
      'networkInfo',
      'currentAddress',
      'provider',
      'tokens',
      'nativeCurrency'
    ]),
    ...mapGetters('account', [
      'treasuryBonusNative',
      'getTokenColor',
      'moveNativePrice'
    ]),
    hasBackButton(): boolean {
      return this.txStep === undefined;
    },
    moveTokenInfo(): SmallTokenInfoWithIcon {
      return getMoveAssetData(this.networkInfo.network);
    },
    claimingForStr(): string {
      if (this.inputAsset === undefined) {
        return '~ $0';
      }
      return `~ $${formatToNative(this.claimingFor)}`;
    },
    description(): string {
      return (
        this.inputAsset !== undefined
          ? this.$t('treasury.claimAndBurn.txtYouChooseMove')
          : ''
      ) as string;
    },
    availableTokens(): Array<TokenWithBalance> {
      const move = getMoveAssetData(this.networkInfo.network);
      const moveWalletBalance =
        this.tokens.find((t: TokenWithBalance) =>
          sameAddress(t.address, move.address)
        )?.balance ?? '0';

      return [
        {
          address: move.address,
          decimals: move.decimals,
          name: move.name,
          symbol: move.symbol,
          priceUSD: this.moveNativePrice,
          logo: move.iconURL,
          isFavorite: true,
          isVerified: true,
          balance: moveWalletBalance,
          marketCap: Number.MAX_SAFE_INTEGER
        }
      ];
    }
  },
  watch: {
    tokens: {
      immediate: true,
      async handler(newVal: Array<TokenWithBalance>) {
        this.isLoading = true;
        try {
          if (!this.isTokenSelectedByUser) {
            const move = newVal.find((t: TokenWithBalance) =>
              sameAddress(t.address, this.moveTokenInfo.address)
            );
            if (move) {
              this.inputAsset = move;
            }
          }

          this.maxBurnedAmount = await getMaxBurn(
            this.currentAddress,
            this.networkInfo.network,
            this.provider.web3
          );
        } catch (err) {
          console.log(`can't load max burn: ${JSON.stringify(err)}`);
          Sentry.captureException(err);
        } finally {
          this.isLoading = false;
        }
      }
    }
  },
  methods: {
    ...mapActions('account', {
      updateWalletAfterTxn: 'updateWalletAfterTxn'
    }),
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
    handleBack(): void {
      if (this.isShowReview) {
        this.isShowReview = !this.isShowReview;
      } else {
        this.$router.replace({
          name: 'treasury-manage'
        });
      }
    },
    async estimateAction(
      inputAmount: string,
      inputAsset: SmallToken
    ): Promise<CompoundEstimateResponse> {
      const resp = await estimateClaimAndBurnCompound(
        inputAsset,
        inputAmount,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );
      if (resp.error) {
        this.transferError = this.$t('estimationError') as string;
        Sentry.captureException("can't estimate claim and burn");
        throw new Error(`Can't estimate action ${resp.error}`);
      }
      return resp;
    },
    handleToggleInputMode(): void {
      if (this.inputMode === 'NATIVE') {
        this.inputMode = 'TOKEN';
        return;
      }
      this.inputMode = 'NATIVE';
    },
    async handleSelectMaxAmount(): Promise<void> {
      if (this.inputAsset === undefined) {
        return;
      }
      if (this.inputMode === 'TOKEN') {
        await this.updateAmount(this.inputAsset.balance, 'TOKEN');
      } else {
        await this.updateAmount(
          new BigNumber(
            multiply(this.inputAsset.balance, this.inputAsset.priceUSD)
          ).toFixed(2, BigNumber.ROUND_DOWN),
          'NATIVE'
        );
      }
    },
    async handleOpenSelectModal(): Promise<void> {
      const token = await this.setModalIsDisplayed({
        id: ModalType.SearchToken,
        value: true,
        payload: {
          forceTokenArray: this.availableTokens
        }
      });

      if (token === undefined) {
        return;
      }

      this.isTokenSelectedByUser = true;
      this.inputAsset = token;
      this.transferError = undefined;
      this.inputAmount = '';
      this.inputAmountNative = '';
    },
    async handleTxReview(): Promise<void> {
      if (this.inputAsset === undefined) {
        return;
      }

      this.isSubsidizedEnabled = false;
      this.isProcessing = true;
      try {
        const gasLimits = await this.estimateAction(
          this.inputAmount,
          this.inputAsset
        );

        this.actionGasLimit = gasLimits.actionGasLimit;
        this.approveGasLimit = gasLimits.approveGasLimit;

        console.info('Claim and burn action gaslimit:', this.actionGasLimit);
        console.info('Claim and burn approve gaslimit:', this.approveGasLimit);
      } catch (err) {
        this.isSubsidizedEnabled = false;
        this.isProcessing = false;
        console.error(err);
        Sentry.captureException("can't estimate claim and burn for subs");
        return;
      }

      this.isProcessing = false;
      this.isShowReview = true;
    },
    async handleUpdateAmount(val: string): Promise<void> {
      await this.updateAmount(val, this.inputMode);
    },
    async updateAmount(value: string, mode: INPUT_MODE): Promise<void> {
      if (this.inputAsset === undefined || this.isLoading) {
        return;
      }

      this.isLoading = true;

      try {
        if (mode === 'TOKEN') {
          this.inputAmount = value;
          this.inputAmountNative = new BigNumber(
            convertNativeAmountFromAmount(value, this.inputAsset.priceUSD)
          ).toFixed(2);

          if (this.maxBurnedAmount === undefined) {
            this.transferError = this.$t('treasury.claimAndBurn.lblBurnError');
            return;
          }

          if (greaterThan(this.inputAmount, this.maxBurnedAmount)) {
            this.transferError = this.$t(
              'treasury.claimAndBurn.lblBurnLimitReached'
            );
            return;
          }

          this.claimingFor = await getExitingAmount(
            this.currentAddress,
            this.inputAmount,
            this.networkInfo.network,
            this.provider.web3
          );

          this.transferError = undefined;
        } else {
          this.inputAmount = convertAmountFromNativeValue(
            value,
            this.inputAsset.priceUSD,
            this.inputAsset.decimals
          );
          this.inputAmountNative = value;

          if (this.maxBurnedAmount === undefined) {
            this.transferError = this.$t('treasury.claimAndBurn.lblBurnError');
            return;
          }

          if (greaterThan(this.inputAmount, this.maxBurnedAmount)) {
            this.transferError = this.$t(
              'treasury.claimAndBurn.lblBurnLimitReached'
            );
            return;
          }
          this.claimingFor = await getExitingAmount(
            this.currentAddress,
            this.inputAmount,
            this.networkInfo.network,
            this.provider.web3
          );
          this.transferError = undefined;
        }
      } catch (err) {
        this.transferError = this.$t('exchangeError') as string;
        console.error(`transfer error: ${err}`);
        Sentry.captureException(err);
        if (mode === 'TOKEN') {
          this.inputAmountNative = '0';
        } else {
          this.inputAmount = '0';
        }
      } finally {
        this.isLoading = false;
      }
    },
    async handleTxStart(args: { isSmartTreasury: boolean }): Promise<void> {
      if (this.inputAsset === undefined) {
        console.error('inputAsset is empty during `handleTxStart`');
        Sentry.captureException("can't start treasury claim and burn TX");
        return;
      }

      if (this.inputAmount === '') {
        console.error('inputAmount is empty during `handleTxStart`');
        Sentry.captureException("can't start treasury claim and burn TX");
        return;
      }

      if (this.actionGasLimit === undefined) {
        console.error('action gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start treasury claim and burn TX");
        return;
      }

      if (this.approveGasLimit === undefined) {
        console.error('approve gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start treasury claim and burn TX");
        return;
      }

      console.log('is smart treasury:', args.isSmartTreasury);

      this.txStep = 'Confirm';
      try {
        await claimAndBurnCompound(
          this.inputAsset,
          this.inputAmount,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          this.actionGasLimit,
          this.approveGasLimit,
          async () => {
            this.txStep = 'Process';
          }
        );
        this.txStep = 'Success';
        this.updateWalletAfterTxn();
      } catch (err) {
        this.txStep = 'Reverted';
        console.log('Treasury claim and burn txn reverted');
        Sentry.captureException(err);
      }
    }
  }
});
</script>
