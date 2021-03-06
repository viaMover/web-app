<template>
  <secondary-page
    class="claim-and-burn"
    :has-back-button="hasBackButton"
    @back="handleBack"
  >
    <prepare-form
      v-if="step === 'prepare'"
      :asset="inputAsset"
      has-select-modal
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
      :operation-description="$t('treasury.claimAndBurn.txtYouApproximateExit')"
      :operation-title="claimingForStr"
      :output-asset-heading-text="$t('treasury.claimAndBurn.lblAmountWeBurnIn')"
      :selected-token-description="description"
      :transfer-error="transferError"
      @open-select-modal="handleOpenSelectModal"
      @review-tx="handleTxReview"
      @select-max-amount="handleSelectMaxAmount"
      @toggle-input-mode="handleToggleInputMode"
      @update-amount="handleUpdateAmount"
    />
    <review-form
      v-else-if="step === 'review'"
      :amount="inputAmount"
      :button-text="$t('treasury.claimAndBurn.btnClaimAndBurnWithAssets')"
      :header-title="$t('treasury.claimAndBurn.lblReviewYourDecrease')"
      :input-amount-native-title="$t('treasury.claimAndBurn.lblAndTotalOf')"
      :input-amount-title="$t('treasury.claimAndBurn.lblAmountWeBurnIn')"
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
          :address="inputAsset.address"
          :src="inputAsset.logo"
          :symbol="inputAsset.symbol"
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
import { Modal as ModalType } from '@/store/modules/modals/types';
import { sameAddress } from '@/utils/address';
import {
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  greaterThan,
  multiply
} from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';
import { getMoveAssetData } from '@/wallet/references/data';
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
  name: 'TreasuryClaimAndBurnWrapper',
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
      inputMode: 'TOKEN' as InputMode,
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
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined
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
      getTokenColor: 'getTokenColor',
      moveNativePrice: 'moveNativePrice'
    }),
    ...mapGetters('treasury', {
      treasuryBonusNative: 'treasuryBonusNative'
    }),
    ...mapState('treasury', {
      smartTreasuryOnChainService: 'onChainService'
    }),
    hasBackButton(): boolean {
      return this.step !== 'loader';
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    formattedNativeAmount(): string {
      return `${formatToNative(this.inputAmountNative)} ${
        this.nativeCurrencySymbol
      }`;
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
          ? (this.$t('treasury.claimAndBurn.txtYouChooseMove') as string)
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

          this.maxBurnedAmount = await (
            this.smartTreasuryOnChainService as SmartTreasuryOnChainService
          ).getMaxBurn();
        } catch (error) {
          console.error('Failed to get max burn amount', error);
          Sentry.captureException(error);
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

      this.isProcessing = true;
      try {
        const gasLimits = await (
          this.smartTreasuryOnChainService as SmartTreasuryOnChainService
        ).estimateClaimAndBurnCompound(this.inputAsset, this.inputAmount);

        this.actionGasLimit = gasLimits.actionGasLimit;
        this.approveGasLimit = gasLimits.approveGasLimit;

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
    async handleUpdateAmount(val: string): Promise<void> {
      await this.updateAmount(val, this.inputMode);
    },
    async updateAmount(value: string, mode: InputMode): Promise<void> {
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
            this.transferError = this.$t(
              'treasury.claimAndBurn.lblBurnError'
            ) as string;
            return;
          }

          if (greaterThan(this.inputAmount, this.maxBurnedAmount)) {
            this.transferError = this.$t(
              'treasury.claimAndBurn.lblBurnLimitReached'
            ) as string;
            return;
          }

          this.claimingFor = await (
            this.smartTreasuryOnChainService as SmartTreasuryOnChainService
          ).getExitingAmount(this.inputAmount);

          this.transferError = undefined;
        } else {
          this.inputAmount = convertAmountFromNativeValue(
            value,
            this.inputAsset.priceUSD,
            this.inputAsset.decimals
          );
          this.inputAmountNative = value;

          if (this.maxBurnedAmount === undefined) {
            this.transferError = this.$t(
              'treasury.claimAndBurn.lblBurnError'
            ) as string;
            return;
          }

          if (greaterThan(this.inputAmount, this.maxBurnedAmount)) {
            this.transferError = this.$t(
              'treasury.claimAndBurn.lblBurnLimitReached'
            ) as string;
            return;
          }
          this.claimingFor = await (
            this.smartTreasuryOnChainService as SmartTreasuryOnChainService
          ).getExitingAmount(this.inputAmount);
          this.transferError = undefined;
        }
      } catch (error) {
        this.transferError = this.$t('exchangeError') as string;
        console.error('Failed to update amount', error);
        Sentry.captureException(error);
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

      this.step = 'loader';
      this.transactionStep = 'Confirm';
      try {
        await (
          this.smartTreasuryOnChainService as SmartTreasuryOnChainService
        ).claimAndBurnCompound(
          this.inputAsset,
          this.inputAmount,
          this.actionGasLimit,
          this.approveGasLimit,
          async () => {
            this.transactionStep = 'Process';
          }
        );
        this.transactionStep = 'Success';
        this.updateWalletAfterTxn();
      } catch (error) {
        this.transactionStep = 'Reverted';
        console.error('Failed to claim & burn', error);
        Sentry.captureException(error);
      }
    }
  }
});
</script>
