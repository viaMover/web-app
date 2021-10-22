<template>
  <modal
    close-on-dimmer-click
    :disable-header-bottom-margin="!headerLabel"
    has-header
    :modal-id="modalId"
    show-close-button
  >
    <template v-slot:header>
      <h3 v-if="headerLabel" class="modal-wrapper-info-title">
        {{ headerLabel }}
      </h3>
      <span v-else>&nbsp;</span>
    </template>
    <form-loader v-if="loaderStep != undefined" :step="loaderStep" />
    <form v-else>
      <div class="modal-wrapper-info-items">
        <asset-field
          :amount="input.amount"
          :asset="input.asset"
          field-role="input"
          :label="$t('swaps.lblSwapFrom')"
          :max-amount="maxInputAmount"
          :native-amount="input.nativeAmount"
          use-wallet-tokens
          @update-amount="handleUpdateInputAmount"
          @update-asset="handleUpdateInputAsset"
          @update-native-amount="handleUpdateInputNativeAmount"
        />
      </div>
      <div class="modal-wrapper-info-buttons">
        <button
          class="tx-details"
          :class="{ disabled: !isInfoAvailable }"
          type="button"
          @click="expandInfo"
        >
          <details-picture />
          <span>Deposit Details</span>
        </button>
        <div v-if="showInfo" class="tx-details__content">
          <div class="tx-details__content-item">
            <p class="description">Swapping for</p>
            <div class="value">
              <div class="icon">
                <usdc-picture />
              </div>
              <span>{{ swappingForString }}</span>
            </div>
          </div>
          <div class="tx-details__content-item">
            <p class="description">Estimated annual earnings</p>
            <p class="info">{{ estimatedAnnualEarning }}</p>
          </div>
          <div class="tx-details__content-item">
            <p class="description">Smart Treasury cover</p>
            <div class="value">
              <span>{{ treasuryCover }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-wrapper-info-button">
        <action-button
          :button-class="buttonClass"
          :custom-style="actionButtonStyle"
          :disabled="!actionAvaialble"
          :text="actionButtonText"
          @button-click="handleExecuteDeposit"
        />
      </div>
      <gas-selector
        :approve-gas-limit="approveGasLimit"
        :avaialble-gas-modes="availableGasModes"
        :txn-gas-limit="allGasLimit"
        @selected-gas-changed="handleSelectedGasChanged"
      />
      <div v-if="showFooter" class="modal-info-footer">
        <p>{{ infoFooter }}</p>
      </div>
    </form>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';
import { Properties as CssProperties } from 'csstype';
import Web3 from 'web3';

import {
  getTransferData,
  TransferData,
  ZeroXSwapError
} from '@/services/0x/api';
import { mapError } from '@/services/0x/errors';
import { GetTokenPrice } from '@/services/thegraph/api';
import {
  Modal as ModalTypes,
  TModalPayload
} from '@/store/modules/modals/types';
import { sameAddress } from '@/utils/address';
import {
  add,
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  divide,
  fromWei,
  greaterThan,
  isZero,
  multiply,
  notZero,
  sub,
  toWei
} from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { depositCompound } from '@/wallet/actions/savings/deposit/deposit';
import { estimateDepositCompound } from '@/wallet/actions/savings/deposit/depositEstimate';
import { isSubsidizedAllowed } from '@/wallet/actions/subsidized';
import { getUSDCAssetData } from '@/wallet/references/data';
import {
  GasData,
  SmallToken,
  SmallTokenInfoWithIcon,
  TokenWithBalance
} from '@/wallet/types';

import { ActionButton } from '@/components/buttons';
import { AssetField, FormLoader, GasSelector } from '@/components/controls';
import { Step } from '@/components/controls/form-loader';
import { GasMode, GasModeData } from '@/components/controls/gas-selector.vue';

import DetailsPicture from './details-picture.vue';
import Modal from './modal.vue';
import UsdcPicture from './usdc-picture.vue';

export default Vue.extend({
  name: 'SavingsDepositModal',
  components: {
    AssetField,
    ActionButton,
    GasSelector,
    FormLoader,
    Modal,
    UsdcPicture,
    DetailsPicture
  },
  data() {
    return {
      loaderStep: undefined as Step | undefined,
      infoExpanded: false,
      input: {
        asset: undefined as TokenWithBalance | undefined,
        amount: '',
        nativeAmount: ''
      },
      selectedGasPrice: '0',
      useSubsidized: false,
      subsidizedAvaialbe: false,
      actionGasLimit: '0',
      approveGasLimit: '0',
      transferData: undefined as TransferData | undefined,
      transferError: undefined as undefined | string,
      loading: false,
      modalId: ModalTypes.SavingsDeposit
    };
  },
  computed: {
    ...mapState('account', [
      'networkInfo',
      'currentAddress',
      'provider',
      'gasPrices',
      'tokens',
      'ethPrice',
      'savingsAPY',
      'usdcPriceInWeth',
      'ethPrice'
    ]),
    ...mapState('modals', {
      state: 'state'
    }),
    ...mapGetters('account', ['treasuryBonusNative', 'getTokenColor']),
    outputUSDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    headerLabel(): string | undefined {
      return this.loaderStep ? undefined : 'Deposit';
    },
    showFooter(): boolean {
      return this.input.asset === undefined || !notZero(this.input.amount);
    },
    modalPayload(): boolean {
      return this.state[this.modalId].payload;
    },
    error(): string | undefined {
      if (this.input.asset === undefined) {
        return this.$t('swaps.lblChooseToken') as string;
      }

      if (!notZero(this.input.amount)) {
        return this.$t('lblEnterAmount') as string;
      }

      if (greaterThan(this.input.amount, this.maxInputAmount)) {
        return this.$t('lblInsufficientBalance') as string;
      }

      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    },
    estimatedAnnualEarning(): string {
      if (this.input.asset === undefined) {
        return '';
      }

      let usdcAmount = '0';

      if (sameAddress(this.input.asset.address, this.outputUSDCAsset.address)) {
        usdcAmount = this.input.amount;
      } else if (this.transferData !== undefined) {
        usdcAmount = fromWei(
          this.transferData.buyAmount,
          this.outputUSDCAsset.decimals
        );
      } else {
        return '';
      }

      const usdcNative = multiply(this.usdcPriceInWeth, this.ethPrice);
      const usdcAmountNative = multiply(usdcAmount, usdcNative);
      const apyNative = multiply(
        divide(this.savingsAPY, 100),
        usdcAmountNative
      );

      return `+$${formatToNative(apyNative)}`;
    },
    swappingForString(): string {
      if (this.input.asset === undefined) {
        return '';
      }

      let buyedUSDC = '0';

      if (sameAddress(this.input.asset.address, this.outputUSDCAsset.address)) {
        buyedUSDC = this.input.amount;
      } else if (this.transferData !== undefined) {
        buyedUSDC = fromWei(
          this.transferData.buyAmount,
          this.outputUSDCAsset.decimals
        );
      } else {
        return '';
      }

      return `${buyedUSDC} ${this.outputUSDCAsset.symbol}`;
    },
    treasuryCover(): string {
      const depositPriceInWEI = multiply(
        this.selectedGasPriceInWEI,
        this.actionGasLimit
      );

      const depositPriceInEth = Web3.utils.fromWei(depositPriceInWEI, 'ether');
      const depositPriceNative = multiply(depositPriceInEth, this.ethPrice);

      if (this.useSubsidized) {
        return `$${formatToNative(depositPriceNative)}`;
      } else {
        return '$0.00';
      }
    },
    selectedGasPriceInWEI(): string {
      return Web3.utils.toWei(this.selectedGasPrice, 'Gwei');
    },
    actionAvaialble(): boolean {
      return this.error === undefined && !this.loading;
    },
    actionButtonText(): string {
      if (this.loading) {
        return 'Loading';
      }
      if (this.error !== undefined) {
        return this.error;
      }

      return '💰 Deposit';
    },
    availableGasModes(): Array<GasMode> {
      if (this.subsidizedAvaialbe) {
        return ['treasury', 'low', 'normal', 'high'];
      } else {
        return ['low', 'normal', 'high'];
      }
    },
    allGasLimit(): string {
      console.log(
        'all gas limit: ',
        add(this.approveGasLimit, this.actionGasLimit)
      );
      return add(this.approveGasLimit, this.actionGasLimit);
    },
    maxInputAmount(): string {
      if (this.input.asset === undefined) {
        return '0';
      }
      if (this.input.asset.address === 'eth') {
        const txnPriceInWeth = multiply(
          this.allGasLimit,
          this.selectedGasPriceInWEI
        );
        const txnPriceInEth = fromWei(txnPriceInWeth, 18);
        const remaining = sub(this.input.asset.balance, txnPriceInEth);
        return greaterThan(remaining, 0) ? remaining : '0';
      }
      return this.input.asset.balance;
    },
    buttonClass(): string {
      if (this.actionAvaialble) {
        return 'button active';
      } else {
        return 'button inactive';
      }
    },
    isInfoAvailable(): boolean {
      return (!this.needTransfer || !!this.transferData) && !this.error;
    },
    needTransfer(): boolean {
      if (this.input.asset === undefined) {
        return true;
      }

      return !sameAddress(
        this.input.asset.address,
        this.outputUSDCAsset.address
      );
    },
    showInfo(): boolean {
      return this.infoExpanded && !this.loading && this.isInfoAvailable;
    },
    infoFooter(): string {
      return 'Once you deposit your assets in savings, Mover is constantly searching for the highest paying option using multiple DeFi protocols. Mover does automatic rebalancing, yield collection, and capital optimization. ';
    },
    toAssetColor(): string | undefined {
      if (this.input.asset === undefined) {
        return undefined;
      }
      return this.getTokenColor(this.input.asset.address);
    },
    actionButtonStyle(): CssProperties {
      if (this.actionAvaialble) {
        return {
          backgroundColor: this.toAssetColor
        };
      }
      return {};
    }
  },
  watch: {
    gasPrices(newVal: GasData, oldVal: GasData) {
      if (newVal === oldVal) {
        return;
      }

      if (this.selectedGasPrice === '0') {
        this.selectedGasPrice = newVal.ProposeGas.price;
        this.checkSubsidizedAvailability();
      }
    },
    modalPayload(newVal: TModalPayload<ModalTypes.SavingsDeposit> | undefined) {
      if (newVal === undefined) {
        return;
      }

      this.loaderStep = undefined;
      this.infoExpanded = false;
      this.loading = false;
      this.transferData = undefined;
      this.transferError = undefined;
      this.useSubsidized = false;
      this.actionGasLimit = '0';
      this.approveGasLimit = '0';

      this.input.asset = undefined;
      this.input.amount = '';
      this.input.nativeAmount = '';
      this.selectedGasPrice = this.gasPrices?.ProposeGas.price ?? '0';
      this.checkSubsidizedAvailability();
    }
  },
  methods: {
    expandInfo(): void {
      this.infoExpanded = !this.infoExpanded;
    },
    async handleExecuteDeposit(): Promise<void> {
      if (this.needTransfer && this.transferData === undefined) {
        console.error(
          "[deposit-form] can't execute deposit due to empty transfer data"
        );
        return;
      }
      if (this.input.asset === undefined) {
        console.error(
          "[deposit-form] can't execute deposit due to empty input asset"
        );
        return;
      }

      this.loaderStep = 'Confirm';
      try {
        await depositCompound(
          this.input.asset,
          this.outputUSDCAsset,
          this.input.amount,
          this.transferData,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          this.useSubsidized,
          async () => {
            this.loaderStep = 'Process';
          },
          this.actionGasLimit,
          this.approveGasLimit,
          this.selectedGasPrice
        );
        this.loaderStep = 'Success';
      } catch (err) {
        this.loaderStep = 'Reverted';
        Sentry.captureException(err);
      }
    },
    async handleUpdateInputAmount(amount: string): Promise<void> {
      this.input.amount = amount;
      if (this.input.asset === undefined) {
        return;
      }

      if (!notZero(this.input.amount)) {
        this.input.nativeAmount = '0';
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        this.input.nativeAmount = convertNativeAmountFromAmount(
          this.input.amount,
          this.input.asset.priceUSD
        );

        const transferData = await this.calcData(
          this.input.asset,
          this.input.amount
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          transferData
        );
      } catch (err) {
        if (err instanceof ZeroXSwapError) {
          this.transferError = mapError(err.publicMessage);
        } else {
          console.error(`can't calc data: ${err}`);
          this.transferError = 'Exchange error';
          Sentry.captureException(err);
        }
        this.transferData = undefined;
        console.error(`can't calc data: ${err}`);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateInputNativeAmount(amount: string): Promise<void> {
      this.input.nativeAmount = amount;
      if (this.input.asset === undefined) {
        return;
      }

      if (!notZero(this.input.nativeAmount)) {
        this.input.amount = '0';
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        this.input.amount = convertAmountFromNativeValue(
          this.input.nativeAmount,
          this.input.asset.priceUSD,
          this.input.asset.decimals
        );

        const transferData = await this.calcData(
          this.input.asset,
          this.input.amount
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          transferData
        );
      } catch (err) {
        if (err instanceof ZeroXSwapError) {
          this.transferError = mapError(err.publicMessage);
        } else {
          console.error(`can't calc data: ${err}`);
          this.transferError = 'Exchange error';
          Sentry.captureException(err);
        }
        this.transferData = undefined;
        console.error(`can't calc data: ${err}`);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateInputAsset(asset: TokenWithBalance): Promise<void> {
      const price = await GetTokenPrice(asset.address);
      this.input.asset = asset;
      if (!this.input.asset.priceUSD && price !== '0') {
        this.input.asset.priceUSD = price;
      }
      this.input.amount = '';
      this.input.nativeAmount = '';

      this.actionGasLimit = '0';
      this.transferData = undefined;
    },
    handleSelectedGasChanged(newGas: GasModeData): void {
      this.useSubsidized = newGas.mode === 'treasury';
      this.selectedGasPrice = String(newGas.price);
      this.checkSubsidizedAvailability();
    },
    async calcData(
      inputAsset: SmallToken,
      amount: string
    ): Promise<TransferData | undefined> {
      const inputInWei = toWei(amount, inputAsset.decimals);

      if (sameAddress(inputAsset.address, this.outputUSDCAsset.address)) {
        this.transferData = undefined;
        return undefined;
      }

      const transferData = await getTransferData(
        this.outputUSDCAsset.address,
        inputAsset.address,
        inputInWei,
        true,
        '0.01',
        this.networkInfo.network
      );
      this.transferData = transferData;
      return transferData;
    },
    async tryToEstimate(
      inputAmount: string,
      inputAsset: SmallToken,
      transferData: TransferData | undefined
    ): Promise<void> {
      const resp = await estimateDepositCompound(
        inputAsset,
        this.outputUSDCAsset,
        inputAmount,
        transferData,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );
      if (resp.error) {
        this.transferError = 'estimationError';
        Sentry.captureException("can't estimate savings deposit");
        return;
      }
      this.actionGasLimit = resp.actionGasLimit;
      this.approveGasLimit = resp.approveGasLimit;
      this.checkSubsidizedAvailability();
    },
    checkSubsidizedAvailability(): void {
      const gasPrice = this.gasPrices?.FastGas.price ?? '0';
      const ethPrice = this.ethPrice ?? '0';
      if (isZero(gasPrice) || isZero(this.actionGasLimit) || isZero(ethPrice)) {
        console.log(
          "With empty parameter we don't allow subsidized transaction"
        );
        this.subsidizedAvaialbe = false;
        return;
      }

      if (this.input.asset?.address === 'eth') {
        this.subsidizedAvaialbe = false;
        return;
      }

      this.subsidizedAvaialbe = isSubsidizedAllowed(
        gasPrice,
        this.actionGasLimit,
        this.ethPrice,
        this.treasuryBonusNative
      );
    }
  }
});
</script>
