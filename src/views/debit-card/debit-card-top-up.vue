<template>
  <secondary-page
    class="top-up"
    :has-back-button="hasBackButton"
    @back="handleBack"
  >
    <prepare-form
      v-if="step === 'prepare'"
      :asset="inputAsset"
      has-select-modal
      :header-description="$t('debitCard.topUp.txtTopUp')"
      :header-title="$t('debitCard.topUp.lblTopUp')"
      :input-amount="inputAmount"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('debitCard.topUp.lblWhatDoWeTopUp')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :operation-description="$t('debitCard.topUp.txtApproximateEUREstimation')"
      :operation-title="approximateEUREstimationText"
      :output-asset-heading-text="$t('debitCard.topUp.lblAmountWeDepositIn')"
      :selected-token-description="description"
      :transfer-error="transferErrorComplex"
      @open-select-modal="handleOpenSelectModal"
      @review-tx="handleTxReview"
      @select-max-amount="handleSelectMaxAmount"
      @toggle-input-mode="handleToggleInputMode"
      @update-amount="handleUpdateAmount"
    >
      <template v-slot:swap-message>
        <div
          v-if="isSwapNeeded && formattedUSDCTotal && inputMode === 'TOKEN'"
          class="section swap-message"
        >
          {{ $t('forms.lblSwappingFor') }}
          <custom-picture
            :alt="$t('lblTokenAlt', { symbol: 'USDc' })"
            class="token-icon inline"
            :sources="usdcPicture.sources"
            :src="usdcPicture.src"
          />
          <span>{{ formattedUSDCTotal }}</span>
        </div>
      </template>
    </prepare-form>
    <review-form
      v-else-if="step === 'review'"
      :amount="inputAmount"
      :button-text="$t('debitCard.topUp.btnTopUpCard')"
      :header-title="$t('debitCard.topUp.lblReviewYourTopUp')"
      :image="currentSkin.previewPicture"
      :input-amount-native-title="$t('debitCard.topUp.lblAndItWillBeTotalOf')"
      :input-amount-title="$t('debitCard.topUp.lblAmountWeTopUpIn')"
      :native-amount="formattedNativeAmount"
      :token="inputAsset"
      @tx-start="handleTxStart"
    />
    <loader-form v-else-if="step === 'loader'" :step="transactionStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';
import BigNumber from 'bignumber.js';

import { sendGlobalTopMessageEvent } from '@/global-event-bus';
import {
  getTransferData,
  TransferData,
  ZeroXSwapError
} from '@/services/0x/api';
import { mapError } from '@/services/0x/errors';
import { getUsdcPriceInEur } from '@/services/coingecko/tokens';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { isBaseAsset, sameAddress } from '@/utils/address';
import {
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  divide,
  fromWei,
  getInteger,
  isZero,
  lessThan,
  multiply,
  toWei
} from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { topUpCompound } from '@/wallet/actions/debit-card/top-up/top-up';
import { estimateTopUpCompound } from '@/wallet/actions/debit-card/top-up/top-up-estimate';
import { calcTransactionFastNativePrice } from '@/wallet/actions/subsidized';
import {
  getALCXAssetData,
  getBTRFLYAssetData,
  getEURSAssetData,
  getUSDCAssetData,
  lookupAddress,
  validTopUpAssets
} from '@/wallet/references/data';
import {
  SmallTokenInfo,
  SmallTokenInfoWithIcon,
  tokenToSmallTokenInfo,
  TokenWithBalance
} from '@/wallet/types';

import {
  InputMode,
  LoaderForm,
  LoaderStep,
  PrepareForm,
  ReviewForm
} from '@/components/forms';
import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { SecondaryPage } from '@/components/layout/secondary-page';

type ProcessStep = 'prepare' | 'review' | 'loader';

const MINIMUM_AMOUNT = '25';

export default Vue.extend({
  name: 'DebitCardTopUp',
  components: {
    CustomPicture,
    ReviewForm,
    PrepareForm,
    LoaderForm,
    SecondaryPage
  },
  props: {
    step: {
      type: String as PropType<ProcessStep>,
      required: true
    }
  },
  data() {
    return {
      //current
      transactionStep: undefined as LoaderStep | undefined,
      ethPicture: {
        src: require('@/assets/images/ETH.png'),
        sources: [
          {
            src: require('@/assets/images/ETH@2x.png'),
            variant: '2x'
          }
        ]
      },
      usdcPicture: {
        src: require('@/assets/images/USDC.png'),
        sources: [
          {
            src: require('@/assets/images/USDC@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor,

      //prepare
      isLoading: true,
      isProcessing: false,
      isTokenSelectedByUser: false,
      inputMode: 'TOKEN' as InputMode,
      inputAsset: undefined as TokenWithBalance | undefined,
      inputAmount: '',
      inputAmountNative: '',
      transferData: undefined as TransferData | undefined,
      transferError: undefined as undefined | string,
      usdcPriceInEur: undefined as undefined | string,

      //to tx
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined,
      unwrapGasLimit: undefined as string | undefined,
      approximateEUREstimationAmount: '0',
      approximateEstimationDebounceHandler: undefined as number | undefined
    };
  },
  computed: {
    ...mapState('account', [
      'networkInfo',
      'currentAddress',
      'nativeCurrency',
      'gasPrices',
      'ethPrice',
      'tokens',
      'savingsAPY',
      'usdcPriceInWeth',
      'eursPriceInWeth',
      'savingsBalance',
      'provider'
    ]),
    ...mapState('debitCard', {
      wxBTRFLYrealIndex: 'wxBTRFLYrealIndex',
      gALCXToALCXMultiplier: 'gALCXToALCXMultiplier'
    }),
    ...mapGetters('account', ['treasuryBonusNative']),
    ...mapGetters('debitCard', {
      currentSkin: 'currentSkin'
    }),
    usdcAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    eursAsset(): SmallTokenInfo {
      return getEURSAssetData(this.networkInfo.network);
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    isSwapNeeded(): boolean {
      if (this.inputAsset === undefined) {
        return true;
      }

      return !sameAddress(this.inputAsset.address, this.usdcAsset.address);
    },
    transferErrorComplex(): string | undefined {
      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return lessThan(this.approximateEUREstimationAmount, MINIMUM_AMOUNT)
        ? this.$t('debitCard.errors.minAmount', {
            min: MINIMUM_AMOUNT
          }).toString()
        : undefined;
    },
    description(): string {
      return (
        this.isSwapNeeded
          ? this.$t('debitCard.topUp.txtNonNativeAsset')
          : this.$t('debitCard.topUp.txtNativeAsset')
      ) as string;
    },
    hasBackButton(): boolean {
      return this.step !== 'loader';
    },
    approximateEUREstimationText(): string {
      return `~ €${formatToNative(this.approximateEUREstimationAmount)}`;
    },
    formattedNativeAmount(): string {
      return `${formatToNative(this.approximateEUREstimationAmount)} EUR`;
    },
    formattedUSDCTotal(): string {
      if (this.inputAsset === undefined) {
        return '0 USDC';
      }

      if (sameAddress(this.inputAsset.address, this.usdcAsset.address)) {
        return `${formatToNative(this.inputAmount)} USDC`;
      }

      if (this.transferData !== undefined) {
        const boughtUSDC = fromWei(
          this.transferData.buyAmount,
          this.usdcAsset.decimals
        );
        return `${formatToNative(boughtUSDC)} USDC`;
      }

      return '';
    },
    isNeedTransfer(): boolean {
      if (this.inputAsset === undefined) {
        return true;
      }

      return !sameAddress(this.inputAsset.address, this.usdcAsset.address);
    },
    validTokens(): Array<TokenWithBalance> {
      const validAssetAddresses = validTopUpAssets(
        this.networkInfo.network
      ).map((address: string) => address.toLowerCase());

      return this.tokens.filter((token: TokenWithBalance) =>
        validAssetAddresses.includes(token.address.toLowerCase())
      );
    }
  },
  watch: {
    tokens: {
      immediate: true,
      handler(newVal: Array<TokenWithBalance>) {
        try {
          if (this.isTokenSelectedByUser) {
            return;
          }
          const eth = newVal.find((t: TokenWithBalance) =>
            isBaseAsset(t.address, this.networkInfo?.network)
          );
          if (eth !== undefined) {
            this.inputAsset = eth;
            return;
          }
          const usdc = newVal.find((t: TokenWithBalance) =>
            sameAddress(t.address, this.usdcAsset.address)
          );
          if (usdc !== undefined) {
            this.inputAsset = usdc;
            return;
          }
        } finally {
          this.isLoading = false;
        }
      }
    }
  },
  methods: {
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
    ...mapActions('account', {
      updateWalletAfterTxn: 'updateWalletAfterTxn'
    }),
    handleBack(): void {
      if (this.step === 'review') {
        this.$router.back();
      } else {
        this.$router.replace({ name: 'debit-card-manage' });
      }
    },
    changeStep(step: ProcessStep): void {
      this.$router.push({ name: 'debit-card-top-up', params: { step } });
    },
    async handleTxReview(): Promise<void> {
      if (this.inputAsset === undefined) {
        return;
      }

      this.actionGasLimit = '0';
      this.approveGasLimit = '0';
      this.unwrapGasLimit = '0';
      this.isProcessing = true;
      try {
        const gasLimits = await estimateTopUpCompound(
          this.inputAsset,
          this.usdcAsset,
          this.inputAmount,
          this.transferData,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress
        );

        this.actionGasLimit = gasLimits.actionGasLimit;
        this.approveGasLimit = gasLimits.approveGasLimit;
        this.unwrapGasLimit = gasLimits.unwrapGasLimit;
        this.changeStep('review');
      } catch (error) {
        sendGlobalTopMessageEvent(
          this.$t('errors.estimationFailed') as string,
          'error'
        );
        addSentryBreadcrumb({
          type: 'error',
          category: 'debit-card.top-up.handleTxReview',
          message: 'Failed to estimate top-up',
          data: {
            error
          }
        });
        console.error('Failed to estimate transaction', error);
        Sentry.captureException(error);
      } finally {
        this.isProcessing = false;
      }
    },
    subsidizedTxNativePrice(actionGasLimit: string): string | undefined {
      const gasPrice = this.gasPrices?.FastGas.price ?? '0';
      const ethPrice = this.ethPrice ?? '0';
      if (isZero(gasPrice) || isZero(actionGasLimit) || isZero(ethPrice)) {
        return undefined;
      }
      return calcTransactionFastNativePrice(
        gasPrice,
        actionGasLimit,
        this.ethPrice
      );
    },
    async handleUpdateAmount(val: string): Promise<void> {
      await this.updateAmount(val, this.inputMode);
    },
    async updateApproximateEURSEstimationValue(mode: InputMode): Promise<void> {
      if (this.approximateEstimationDebounceHandler !== undefined) {
        // clear debounce handler to prevent last queued update from
        // being executed
        window.clearTimeout(this.approximateEstimationDebounceHandler);
      }

      // set up a debounce handler
      this.approximateEstimationDebounceHandler = window.setTimeout(
        async () => {
          try {
            const usdcPriceInEur = await this.getUsdcPriceInEur();
            if (usdcPriceInEur) {
              if (
                sameAddress(this.inputAsset?.address, this.usdcAsset.address) &&
                !isZero(this.inputAmount) &&
                this.inputAmount !== ''
              ) {
                this.approximateEUREstimationAmount = multiply(
                  this.inputAmount,
                  usdcPriceInEur
                );
                return;
              }

              if (this.transferData) {
                const boughtUSDC = fromWei(
                  this.transferData.buyAmount,
                  this.usdcAsset.decimals
                );

                this.approximateEUREstimationAmount = multiply(
                  boughtUSDC,
                  usdcPriceInEur
                );
                return;
              }
            }

            const referenceAmount =
              mode === 'TOKEN' ? this.inputAmount : this.inputAmountNative;
            let referenceToken =
              mode === 'TOKEN' ? this.inputAsset : this.usdcAsset;
            if (referenceToken === undefined) {
              // if reference token is an arbitrary token
              // but is evaluated as undefined, we preserve the last estimated amount
              return;
            }

            let inputInWei = toWei(referenceAmount, referenceToken.decimals);

            if (
              sameAddress(
                referenceToken.address,
                lookupAddress(
                  this.networkInfo.network,
                  'WX_BTRFLY_TOKEN_ADDRESS'
                )
              )
            ) {
              const newInputInTokens = multiply(
                fromWei(inputInWei, referenceToken.decimals),
                fromWei(this.wxBTRFLYrealIndex, 9)
              );
              referenceToken = getBTRFLYAssetData(this.networkInfo.network);
              inputInWei = getInteger(
                toWei(newInputInTokens, referenceToken.decimals)
              );
            }

            // gALCX unstake substitute
            if (
              sameAddress(
                referenceToken.address,
                lookupAddress(this.networkInfo.network, 'GALCX_TOKEN_ADDRESS')
              )
            ) {
              const newInputInTokens = multiply(
                fromWei(inputInWei, referenceToken.decimals),
                fromWei(this.gALCXToALCXMultiplier, 18)
              );
              referenceToken = getALCXAssetData(this.networkInfo.network);
              inputInWei = getInteger(
                toWei(newInputInTokens, referenceToken.decimals)
              );
            }

            if (isZero(referenceAmount) || referenceAmount === '') {
              // in case of 0 amount or token has been changed
              // we assume that no estimation required and reassign a 0
              // to the estimated amount
              this.approximateEUREstimationAmount = '0';
              return;
            }

            const transferData = await getTransferData(
              this.eursAsset.address,
              referenceToken.address,
              inputInWei,
              true,
              '10',
              this.networkInfo.network
            );

            this.approximateEUREstimationAmount = fromWei(
              transferData.buyAmount,
              this.eursAsset.decimals
            );
          } catch (error) {
            console.warn(
              'failed to estimate output in EURS, using fallback',
              error instanceof ZeroXSwapError
                ? mapError(error.publicMessage)
                : error
            );

            if (
              this.inputAmountNative === '' ||
              this.usdcPriceInWeth === undefined ||
              this.eursPriceInWeth === undefined
            ) {
              return;
            }

            const eursPerUsdc = divide(
              this.eursPriceInWeth,
              this.usdcPriceInWeth
            );
            // if no transfer data is available or some conditions
            // are not met then we use a fallback to give user
            // much more rough estimate of output amount
            this.approximateEUREstimationAmount = multiply(
              this.inputAmountNative,
              eursPerUsdc
            );
          }
        },
        250
      );
    },
    async getUsdcPriceInEur(): Promise<string | undefined> {
      if (this.usdcPriceInEur !== undefined) {
        return this.usdcPriceInEur;
      }

      const res = await getUsdcPriceInEur();
      if (res.isError) {
        addSentryBreadcrumb({
          type: 'error',
          category: 'debit-card.top-up.getUsdcPriceInEur',
          message: 'failed to get USDC price in EUR',
          data: {
            error: res.error
          }
        });
        return undefined;
      }

      this.usdcPriceInEur = res.result;
      return res.result;
    },
    async updateAmount(value: string, mode: InputMode): Promise<void> {
      if (this.inputAsset === undefined || this.isLoading) {
        return;
      }

      this.isLoading = true;

      try {
        this.approximateEUREstimationAmount = '0';
        this.transferError = undefined;
        if (!this.isSwapNeeded) {
          this.transferData = undefined;
          if (mode === 'TOKEN') {
            this.inputAmount = value;
            this.inputAmountNative = convertNativeAmountFromAmount(
              value,
              this.inputAsset.priceUSD
            );
          } else {
            this.inputAmount = convertAmountFromNativeValue(
              value,
              this.inputAsset.priceUSD,
              this.inputAsset.decimals
            );
            this.inputAmountNative = value;
          }
        } else {
          if (mode === 'TOKEN') {
            this.inputAmount = value;
            this.inputAmountNative = new BigNumber(
              convertNativeAmountFromAmount(value, this.inputAsset.priceUSD)
            ).toFixed(2);
            let referenceToken = tokenToSmallTokenInfo(this.inputAsset);
            let inputInWei = toWei(value, referenceToken.decimals);

            if (
              sameAddress(
                referenceToken.address,
                lookupAddress(
                  this.networkInfo.network,
                  'WX_BTRFLY_TOKEN_ADDRESS'
                )
              )
            ) {
              const newInputInTokens = multiply(
                fromWei(inputInWei, referenceToken.decimals),
                fromWei(this.wxBTRFLYrealIndex, 9)
              );
              referenceToken = getBTRFLYAssetData(this.networkInfo.network);
              inputInWei = getInteger(
                toWei(newInputInTokens, referenceToken.decimals)
              );
            }

            // gALCX unstake substitute
            if (
              sameAddress(
                referenceToken.address,
                lookupAddress(this.networkInfo.network, 'GALCX_TOKEN_ADDRESS')
              )
            ) {
              const newInputInTokens = multiply(
                fromWei(inputInWei, referenceToken.decimals),
                fromWei(this.gALCXToALCXMultiplier, 18)
              );
              referenceToken = getALCXAssetData(this.networkInfo.network);
              inputInWei = getInteger(
                toWei(newInputInTokens, referenceToken.decimals)
              );
            }

            this.transferData = await getTransferData(
              this.usdcAsset.address,
              referenceToken.address,
              inputInWei,
              true,
              '10',
              this.networkInfo.network
            );
          } else {
            this.inputAmountNative = value;

            let referenceToken = tokenToSmallTokenInfo(this.inputAsset);
            let inputInWei = toWei(
              convertAmountFromNativeValue(
                value,
                this.inputAsset.priceUSD,
                this.inputAsset.decimals
              ),
              this.inputAsset.decimals
            );

            if (
              sameAddress(
                referenceToken.address,
                lookupAddress(
                  this.networkInfo.network,
                  'WX_BTRFLY_TOKEN_ADDRESS'
                )
              )
            ) {
              const newInputInTokens = multiply(
                fromWei(inputInWei, referenceToken.decimals),
                fromWei(this.wxBTRFLYrealIndex, 9)
              );
              referenceToken = getBTRFLYAssetData(this.networkInfo.network);
              inputInWei = getInteger(
                toWei(newInputInTokens, referenceToken.decimals)
              );
            }

            // gALCX unstake substitute
            if (
              sameAddress(
                referenceToken.address,
                lookupAddress(this.networkInfo.network, 'GALCX_TOKEN_ADDRESS')
              )
            ) {
              const newInputInTokens = multiply(
                fromWei(inputInWei, referenceToken.decimals),
                fromWei(this.gALCXToALCXMultiplier, 18)
              );
              referenceToken = getALCXAssetData(this.networkInfo.network);
              inputInWei = getInteger(
                toWei(newInputInTokens, referenceToken.decimals)
              );
            }

            this.transferData = await getTransferData(
              this.usdcAsset.address,
              referenceToken.address,
              inputInWei,
              true,
              '10',
              this.networkInfo.network
            );
            this.inputAmount = fromWei(
              this.transferData.sellAmount,
              this.inputAsset.decimals
            );
          }
        }
        await this.updateApproximateEURSEstimationValue(mode);
      } catch (error) {
        if (error instanceof ZeroXSwapError) {
          this.transferError = mapError(error.publicMessage);
        } else {
          this.transferError = this.$t('exchangeError') as string;
          Sentry.captureException(error);
        }
        console.error('transfer error', error);
        this.transferData = undefined;
        if (mode === 'TOKEN') {
          this.inputAmountNative = '0';
        } else {
          this.inputAmount = '0';
        }
      } finally {
        this.isLoading = false;
      }
    },
    async handleOpenSelectModal(): Promise<void> {
      const token = await this.setModalIsDisplayed({
        id: ModalType.SearchToken,
        value: true,
        payload: {
          useWalletTokens: true,
          forceTokenArray: this.validTokens
        }
      });

      if (token === undefined) {
        return;
      }
      this.isTokenSelectedByUser = true;
      this.inputAsset = token;
      this.transferData = undefined;
      this.transferError = undefined;
      this.inputAmount = '';
      this.inputAmountNative = '';
      this.updateApproximateEURSEstimationValue(this.inputMode);
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
    async handleTxStart(args: { isSmartTreasury: boolean }): Promise<void> {
      if (this.inputAsset === undefined) {
        addSentryBreadcrumb({
          type: 'error',
          category: 'debit-card.top-up.handleTxStart',
          message: 'inputAsset is empty during `handleTxStart`'
        });
        Sentry.captureException("can't start top-up TX");
        return;
      }

      if (this.inputAmount === '') {
        addSentryBreadcrumb({
          type: 'error',
          category: 'debit-card.top-up.handleTxStart',
          message: 'inputAmount is empty during `handleTxStart`'
        });
        Sentry.captureException("can't start top-up TX");
        return;
      }

      if (this.actionGasLimit === undefined) {
        addSentryBreadcrumb({
          type: 'error',
          category: 'debit-card.top-up.handleTxStart',
          message: 'action gas limit is empty during `handleTxStart`'
        });
        Sentry.captureException("can't start top-up TX");
        return;
      }

      if (this.approveGasLimit === undefined) {
        addSentryBreadcrumb({
          type: 'error',
          category: 'debit-card.top-up.handleTxStart',
          message: 'approve gas limit is empty during `handleTxStart`'
        });
        Sentry.captureException("can't start top-up TX");
        return;
      }

      if (this.unwrapGasLimit === undefined) {
        addSentryBreadcrumb({
          type: 'error',
          category: 'debit-card.top-up.handleTxStart',
          message: 'unwrap gas limit is empty during `handleTxStart`'
        });
        Sentry.captureException("can't start top-up TX");
        return;
      }

      if (this.isNeedTransfer && this.transferData === undefined) {
        addSentryBreadcrumb({
          type: 'error',
          category: 'debit-card.top-up.handleTxStart',
          message:
            'transfer data is empty during `handleTxStart` when it is needed'
        });
        Sentry.captureException("can't start top-up TX");
        return;
      }

      addSentryBreadcrumb({
        type: 'debug',
        category: 'debit-card.top-up.handleTxStart',
        data: {
          isSmartTreasury: args.isSmartTreasury,
          inputAsset: this.inputAsset,
          inputAmount: this.inputAmount,
          transferData: this.transferData,
          network: this.networkInfo.network,
          currentAddress: this.currentAddress,
          actionGasLimit: this.actionGasLimit,
          approveGasLimit: this.approveGasLimit,
          unwrapGasLimit: this.unwrapGasLimit
        }
      });

      this.changeStep('loader');
      this.transactionStep = 'Confirm';
      try {
        await topUpCompound(
          this.inputAsset,
          this.usdcAsset,
          this.inputAmount,
          this.transferData,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          async (step: LoaderStep) => {
            this.transactionStep = step;
          },
          this.actionGasLimit,
          this.approveGasLimit,
          this.unwrapGasLimit
        );
        this.transactionStep = 'Success';
        this.updateWalletAfterTxn();
      } catch (err) {
        this.transactionStep = 'Reverted';
        console.error('top up reverted', err);
        Sentry.captureException(err);
      }
    }
  }
});
</script>
