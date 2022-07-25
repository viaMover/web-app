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
      :max-amount="maxAmount"
      :max-amount-native="maxAmountNative"
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
          v-if="!isUsdc && formattedUSDCTotal && inputMode === 'TOKEN'"
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
import { DebitCardOnChainService } from '@/services/v2/on-chain/mover/debit-card';
import { addSentryBreadcrumb } from '@/services/v2/utils/sentry';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { isBaseAsset, sameAddress } from '@/utils/address';
import {
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  divide,
  fromWei,
  greaterThan,
  isZero,
  lessThan,
  multiply,
  toWei
} from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { calcTransactionFastNativePrice } from '@/wallet/actions/subsidized';
import {
  getEURSAssetData,
  getSlippage,
  getUSDCAssetData,
  validTopUpAssets
} from '@/wallet/references/data';
import {
  SmallTokenInfo,
  SmallTokenInfoWithIcon,
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
const MAXIMUM_AMOUNT = '8000';

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
      maxAmount: undefined as string | undefined,
      maxAmountNative: undefined as string | undefined,
      formattedUSDCTotal: undefined as undefined | string,
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
      'eursPriceInWeth',
      'savingsBalance',
      'provider'
    ]),
    ...mapState('debitCard', {
      debitCardOnChainService: 'onChainService',
      emailHash: 'emailHash',
      emailSignature: 'emailSignature'
    }),
    ...mapGetters('account', ['treasuryBonusNative', 'usdcNativePrice']),
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
    isUsdc(): boolean {
      if (this.inputAsset === undefined) {
        return false;
      }
      return sameAddress(this.inputAsset.address, this.usdcAsset.address);
    },
    transferErrorComplex(): string | undefined {
      if (this.transferError !== undefined) {
        return this.transferError;
      }
      if (lessThan(this.approximateEUREstimationAmount, MINIMUM_AMOUNT)) {
        return this.$t('debitCard.errors.minAmount', {
          min: MINIMUM_AMOUNT
        }).toString();
      }

      if (greaterThan(this.approximateEUREstimationAmount, MAXIMUM_AMOUNT)) {
        return this.$t('debitCard.errors.minAmount', {
          max: MAXIMUM_AMOUNT
        }).toString();
      }
      return undefined;
    },
    description(): string {
      return (
        this.isUsdc
          ? this.$t('debitCard.topUp.txtNativeAsset')
          : this.$t('debitCard.topUp.txtNonNativeAsset')
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
    topUpTokenAddress(): string | undefined {
      if (this.inputAsset === undefined) {
        return undefined;
      }

      const unwrappedToken = (
        this.debitCardOnChainService as DebitCardOnChainService
      ).getUnwrappedToken(this.inputAsset);

      return unwrappedToken.address;
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
  async mounted() {
    await this.loadInfo();

    if (this.emailHash === undefined || this.emailSignature === undefined) {
      await this.$router.replace({
        name: 'not-found-route'
      });
    }
  },
  methods: {
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
    ...mapActions('debitCard', {
      loadInfo: 'loadInfo'
    }),
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
        const gasLimits = await (
          this.debitCardOnChainService as DebitCardOnChainService
        ).estimateTopUpCompound(
          this.inputAsset,
          this.inputAmount,
          this.transferData
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
    async updateApproximateEURSEstimationValue(): Promise<void> {
      if (this.approximateEstimationDebounceHandler !== undefined) {
        // clear debounce handler to prevent last queued update from
        // being executed
        window.clearTimeout(this.approximateEstimationDebounceHandler);
      }

      // set up a debounce handler
      this.approximateEstimationDebounceHandler = window.setTimeout(
        async () => {
          try {
            this.isLoading = true;
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

            if (this.inputAsset === undefined) {
              // if reference token is an arbitrary token
              // but is evaluated as undefined, we preserve the last estimated amount
              return;
            }

            const unwrappedData = await (
              this.debitCardOnChainService as DebitCardOnChainService
            ).getUnwrappedData(
              this.inputAsset,
              this.inputAmount,
              this.inputAsset.priceUSD
            );

            const referenceToken: SmallTokenInfo = unwrappedData.unwrappedToken;
            const inputInWei = unwrappedData.amountInWei;

            if (isZero(inputInWei) || this.inputAmount === '') {
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
              getSlippage(referenceToken.address, this.networkInfo.network),
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
              this.usdcNativePrice === undefined ||
              this.eursPriceInWeth === undefined
            ) {
              return;
            }

            const eursPerUsdc = divide(
              multiply(this.eursPriceInWeth, this.ethPrice ?? '0'),
              this.usdcNativePrice
            );
            // if no transfer data is available or some conditions
            // are not met then we use a fallback to give user
            // much more rough estimate of output amount
            this.approximateEUREstimationAmount = multiply(
              this.inputAmountNative,
              eursPerUsdc
            );
          } finally {
            this.isLoading = false;
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
    async calculateUscdNativeAmount(): Promise<void> {
      if (this.inputAsset === undefined) {
        this.formattedUSDCTotal = '0 USDC';
        return;
      }

      // if token is pure USDC
      if (sameAddress(this.inputAsset.address, this.usdcAsset.address)) {
        this.formattedUSDCTotal = `${formatToNative(this.inputAmount)} USDC`;
        return;
      }

      const unwrappedData = await (
        this.debitCardOnChainService as DebitCardOnChainService
      ).getUnwrappedData(
        this.inputAsset,
        this.inputAmount,
        this.inputAsset.priceUSD
      );

      // if unwrapped token is USDC
      if (
        sameAddress(
          unwrappedData.unwrappedToken.address,
          this.usdcAsset.address
        )
      ) {
        const boughtUSDC = fromWei(
          unwrappedData.amountInWei,
          this.usdcAsset.decimals
        );
        this.formattedUSDCTotal = `${formatToNative(boughtUSDC)} USDC`;
        return;
      }

      // otherwise we should have a transfer data with usdc amount
      if (this.transferData !== undefined) {
        const boughtUSDC = fromWei(
          this.transferData.buyAmount,
          this.usdcAsset.decimals
        );
        this.formattedUSDCTotal = `${formatToNative(boughtUSDC)} USDC`;
        return;
      }

      this.formattedUSDCTotal = undefined;
    },
    async updateAmount(value: string, mode: InputMode): Promise<void> {
      if (this.inputAsset === undefined || this.isLoading) {
        return;
      }

      this.isLoading = true;

      try {
        this.approximateEUREstimationAmount = '0';
        this.transferError = undefined;
        if (sameAddress(this.inputAsset.address, this.usdcAsset.address)) {
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
            addSentryBreadcrumb({
              type: 'info',
              message: 'New token amount',
              category: 'debit-card.top-up',
              data: {
                inputNativeAmount: value,
                inputAsset: this.inputAsset
              }
            });

            const unwrappedData = await (
              this.debitCardOnChainService as DebitCardOnChainService
            ).getUnwrappedData(
              this.inputAsset,
              this.inputAmount,
              this.inputAsset.priceUSD
            );

            addSentryBreadcrumb({
              type: 'info',
              message: 'Unwrapped token data',
              category: 'debit-card.top-up',
              data: {
                unwrappedToken: unwrappedData.unwrappedToken,
                unwrappedTokenAmountInWei: unwrappedData.amountInWei,
                unwrappedTokenPrice: unwrappedData.unwrappedTokenPrice
              }
            });

            // try to use price from  unwrapped token
            // in case of simple token unwrapped token will be the same token
            const unwrappedAmount = fromWei(
              unwrappedData.amountInWei,
              unwrappedData.unwrappedToken.decimals
            );

            this.inputAmountNative = new BigNumber(
              convertNativeAmountFromAmount(
                unwrappedAmount,
                unwrappedData.unwrappedTokenPrice
              )
            ).toFixed(2);

            const referenceToken: SmallTokenInfo = unwrappedData.unwrappedToken;
            const inputInWei = unwrappedData.amountInWei;

            if (!sameAddress(referenceToken.address, this.usdcAsset.address)) {
              this.transferData = await getTransferData(
                this.usdcAsset.address,
                referenceToken.address,
                inputInWei,
                true,
                getSlippage(referenceToken.address, this.networkInfo.network),
                this.networkInfo.network
              );
            }
          } else {
            this.inputAmountNative = value;

            addSentryBreadcrumb({
              type: 'info',
              message: 'New native amount',
              category: 'debit-card.top-up',
              data: {
                inputNativeAmount: value,
                inputAsset: this.inputAsset
              }
            });

            const unwrappedToken = (
              this.debitCardOnChainService as DebitCardOnChainService
            ).getUnwrappedToken(this.inputAsset);

            addSentryBreadcrumb({
              type: 'info',
              message: 'unwrapped token',
              category: 'debit-card.top-up',
              data: {
                unwrappedToken: unwrappedToken
              }
            });

            let unwrappedTokenPrice = '0';
            try {
              unwrappedTokenPrice = await (
                this.debitCardOnChainService as DebitCardOnChainService
              ).getUnwrappedTokenPrice(
                this.inputAsset,
                this.inputAsset.priceUSD
              );
            } catch (err) {
              this.transferError = this.$t('exchangeError') as string;
              return;
            }

            addSentryBreadcrumb({
              type: 'info',
              message: 'unwrapped token price',
              category: 'debit-card.top-up',
              data: {
                unwrappedToken: unwrappedToken,
                unwrappedTokenPrice: unwrappedTokenPrice
              }
            });

            const amountOfUnwrappedToken = convertAmountFromNativeValue(
              value,
              unwrappedTokenPrice,
              unwrappedToken.decimals
            );

            addSentryBreadcrumb({
              type: 'info',
              message: 'unwrapped token amount',
              category: 'debit-card.top-up',
              data: {
                unwrappedToken: unwrappedToken,
                unwrappedTokenPrice: unwrappedTokenPrice,
                amountOfUnwrappedToken: amountOfUnwrappedToken
              }
            });

            const wrappedData = await (
              this.debitCardOnChainService as DebitCardOnChainService
            ).getWrappedDataByUnwrapped(
              this.inputAsset,
              unwrappedToken,
              amountOfUnwrappedToken
            );

            addSentryBreadcrumb({
              type: 'info',
              message: 'Wrapped token data',
              category: 'debit-card.top-up',
              data: {
                wrappedToken: wrappedData.wrappedToken,
                wrappedTokenAmountInWei: wrappedData.amountInWei
              }
            });

            this.inputAmount = fromWei(
              wrappedData.amountInWei,
              wrappedData.wrappedToken.decimals
            );

            const referenceToken: SmallTokenInfo = unwrappedToken;
            const inputInWei = toWei(
              amountOfUnwrappedToken,
              unwrappedToken.decimals
            );

            if (!sameAddress(referenceToken.address, this.usdcAsset.address)) {
              this.transferData = await getTransferData(
                this.usdcAsset.address,
                referenceToken.address,
                inputInWei,
                true,
                getSlippage(referenceToken.address, this.networkInfo.network),
                this.networkInfo.network
              );
            } else {
              this.transferData = undefined;
            }
          }
        }

        await this.calculateUscdNativeAmount();
        await this.updateApproximateEURSEstimationValue();
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
      this.isLoading = false;

      this.isTokenSelectedByUser = true;
      this.inputAsset = token;
      this.transferData = undefined;
      this.transferError = undefined;
      this.inputAmount = '';
      this.inputAmountNative = '';
      this.formattedUSDCTotal = undefined;

      const unwrappedData = await (
        this.debitCardOnChainService as DebitCardOnChainService
      ).getUnwrappedData(token, token.balance, token.priceUSD);

      this.maxAmount = token.balance;
      this.maxAmountNative = multiply(
        fromWei(
          unwrappedData.amountInWei,
          unwrappedData.unwrappedToken.decimals
        ),
        unwrappedData.unwrappedTokenPrice
      );

      console.log('unwrappedData|: ', unwrappedData);

      this.updateApproximateEURSEstimationValue();
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
      await this.updateAmount(this.inputAsset.balance, 'TOKEN');
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

      if (
        !sameAddress(this.topUpTokenAddress, this.usdcAsset.address) &&
        this.transferData === undefined
      ) {
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
        await (
          this.debitCardOnChainService as DebitCardOnChainService
        ).topUpCompound(
          this.inputAsset,
          this.inputAmount,
          this.transferData,
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
