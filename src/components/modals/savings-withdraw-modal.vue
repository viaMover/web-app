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
          :amount="output.amount"
          :asset="outputUSDCToken"
          disabled-select-currency
          field-role="input"
          :label="$t('swaps.lblSwapFrom')"
          :max-amount="maxOutputAmount"
          :native-amount="output.nativeAmount"
          use-wallet-tokens
          @update-amount="handleUpdateOutputAmount"
          @update-asset="() => {}"
          @update-native-amount="handleUpdateOutputNativeAmount"
        />
      </div>
      <div class="modal-wrapper-info-buttons">
        <button
          class="tx-details button-active"
          :class="{ disabled: !isInfoAvailable }"
          type="button"
          @click="expandInfo"
        >
          <details-picture />
          <span>Withdraw Details</span>
        </button>
        <div v-if="showInfo" class="tx-details__content">
          <div class="tx-details__content-item">
            <p class="description">Estimated lost annual earnings</p>
            <p class="info">{{ estimatedLostAnnualEarning }}</p>
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
          @button-click="handleExecuteWithdraw"
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
  Modal as ModalTypes,
  TModalPayload
} from '@/store/modules/modals/types';
import {
  add,
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  divide,
  greaterThan,
  isZero,
  multiply,
  notZero
} from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { withdrawCompound } from '@/wallet/actions/savings/withdraw/withdraw';
import { estimateWithdrawCompound } from '@/wallet/actions/savings/withdraw/withdrawEstimate';
import { isSubsidizedAllowed } from '@/wallet/actions/subsidized';
import { getUSDCAssetData } from '@/wallet/references/data';
import {
  GasData,
  SmallToken,
  SmallTokenInfoWithIcon,
  TokenWithBalance
} from '@/wallet/types';

import { ActionButton } from '@/components/buttons';
import { AssetField, GasSelector } from '@/components/controls';
import { GasMode, GasModeData } from '@/components/controls/gas-selector.vue';
import { FormLoader, Step } from '@/components/forms/form-loader';
import DetailsPicture from '@/components/modals/details-picture.vue';

import Modal from './modal.vue';

export default Vue.extend({
  name: 'SavingsWithdrawModal',
  components: {
    AssetField,
    ActionButton,
    GasSelector,
    FormLoader,
    Modal,
    DetailsPicture
  },
  data() {
    return {
      loaderStep: undefined as Step | undefined,
      infoExpanded: false,
      output: {
        amount: '',
        nativeAmount: ''
      },
      selectedGasPrice: '0',
      useSubsidized: false,
      subsidizedAvaialbe: false,
      actionGasLimit: '0',
      approveGasLimit: '0',
      transferError: undefined as undefined | string,
      loading: false,
      modalId: ModalTypes.SavingsWithdraw
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
      'savingsBalance',
      'usdcPriceInWeth',
      'ethPrice'
    ]),
    ...mapState('modals', {
      state: 'state'
    }),
    ...mapGetters('account', [
      'usdcNativePrice',
      'treasuryBonusNative',
      'getTokenColor'
    ]),
    outputUSDCToken(): TokenWithBalance {
      return {
        address: this.outputUSDCAsset.address,
        decimals: this.outputUSDCAsset.decimals,
        symbol: this.outputUSDCAsset.symbol,
        name: 'USDc',
        priceUSD: this.usdcNativePrice,
        logo: this.outputUSDCAsset.iconURL,
        isFavorite: true,
        isVerified: true,
        balance: this.savingsBalance,
        marketCap: Number.MAX_SAFE_INTEGER
      };
    },
    outputUSDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    modalPayload(): boolean {
      return this.state[this.modalId].payload;
    },
    headerLabel(): string | undefined {
      return this.loaderStep ? undefined : 'Withdraw';
    },
    error(): string | undefined {
      if (!notZero(this.output.amount)) {
        return this.$t('lblEnterAmount') as string;
      }

      if (greaterThan(this.output.amount, this.maxOutputAmount)) {
        return this.$t('lblInsufficientBalance') as string;
      }

      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    },
    estimatedLostAnnualEarning(): string {
      const usdcAmount = this.output.amount;
      const usdcNative = multiply(this.usdcPriceInWeth, this.ethPrice);
      const usdcAmountNative = multiply(usdcAmount, usdcNative);
      const apyNative = multiply(
        divide(this.savingsAPY, 100),
        usdcAmountNative
      );

      return `$${formatToNative(apyNative)}`;
    },
    showFooter(): boolean {
      return !notZero(this.output.amount);
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

      return '🚪 Withdraw';
    },
    selectedGasPriceInWEI(): string {
      return Web3.utils.toWei(this.selectedGasPrice, 'Gwei');
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
    maxOutputAmount(): string {
      return this.savingsBalance ?? '0';
    },
    buttonClass(): string {
      if (this.actionAvaialble) {
        return 'button active';
      } else {
        return 'button inactive';
      }
    },
    isInfoAvailable(): boolean {
      return notZero(this.output.amount);
    },
    showInfo(): boolean {
      return this.infoExpanded && !this.loading && this.isInfoAvailable;
    },
    treasuryCover(): string {
      const withdrawPriceInWEI = multiply(
        this.selectedGasPriceInWEI,
        this.actionGasLimit
      );

      const withdrawPriceInEth = Web3.utils.fromWei(
        withdrawPriceInWEI,
        'ether'
      );
      const withdrawPriceNative = multiply(withdrawPriceInEth, this.ethPrice);

      if (this.useSubsidized) {
        return `$${formatToNative(withdrawPriceNative)}`;
      } else {
        return '$0.00';
      }
    },
    infoFooter(): string {
      return 'You can withdraw the entire or partial balance. Available balance consists of principal amount you deposited together with the accumulated yield.';
    },
    toAssetColor(): string | undefined {
      return this.getTokenColor(this.outputUSDCToken.address);
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
    modalPayload(
      newVal: TModalPayload<ModalTypes.SavingsWithdraw> | undefined
    ) {
      if (newVal === undefined) {
        return;
      }

      this.loaderStep = undefined;
      this.infoExpanded = false;
      this.loading = false;
      this.transferError = undefined;
      this.useSubsidized = false;
      this.actionGasLimit = '0';
      this.approveGasLimit = '0';

      this.output.amount = '';
      this.output.nativeAmount = '';
      this.selectedGasPrice = this.gasPrices?.ProposeGas.price ?? '0';
      this.checkSubsidizedAvailability();
    }
  },
  methods: {
    expandInfo(): void {
      this.infoExpanded = !this.infoExpanded;
    },
    async handleExecuteWithdraw(): Promise<void> {
      if (!notZero(this.output.amount)) {
        console.error(
          "[withdraw-form] can't execute withdraw due to zero amount"
        );
        return;
      }

      this.loaderStep = 'Confirm';
      try {
        await withdrawCompound(
          this.outputUSDCAsset,
          this.output.amount,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          this.actionGasLimit,
          this.useSubsidized,
          async () => {
            this.loaderStep = 'Process';
          },
          this.selectedGasPrice
        );
        this.loaderStep = 'Success';
      } catch (err) {
        this.loaderStep = 'Reverted';
        Sentry.captureException(err);
      }
    },
    async handleUpdateOutputAmount(amount: string): Promise<void> {
      this.output.amount = amount;

      if (!notZero(this.output.amount)) {
        this.output.nativeAmount = '0';
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        this.output.nativeAmount = convertNativeAmountFromAmount(
          this.output.amount,
          this.usdcNativePrice
        );

        console.log('this.usdcNativePrice', this.usdcNativePrice);

        await this.tryToEstimate(this.output.amount, this.outputUSDCAsset);
      } catch (err) {
        this.transferError = 'Exchange error';
        console.error(`can't calc data: ${err}`);
        Sentry.captureException(err);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateOutputNativeAmount(amount: string): Promise<void> {
      this.output.nativeAmount = amount;

      if (!notZero(this.output.nativeAmount)) {
        this.output.amount = '0';
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        this.output.amount = convertAmountFromNativeValue(
          this.output.nativeAmount,
          this.usdcNativePrice,
          this.outputUSDCAsset.decimals
        );

        await this.tryToEstimate(this.output.amount, this.outputUSDCAsset);
      } catch (err) {
        this.transferError = 'Exchange error';
        console.error(`can't calc data: ${err}`);
        Sentry.captureException(err);
        return;
      } finally {
        this.loading = false;
      }
    },
    handleSelectedGasChanged(newGas: GasModeData): void {
      this.useSubsidized = newGas.mode === 'treasury';
      this.selectedGasPrice = String(newGas.price);
      this.checkSubsidizedAvailability();
    },
    async tryToEstimate(
      outputAmount: string,
      outputAsset: SmallToken
    ): Promise<void> {
      const resp = await estimateWithdrawCompound(
        outputAsset,
        outputAmount,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );
      if (resp.error) {
        console.error(resp.error);
        this.transferError = 'Estimate error';
        Sentry.captureException("can't estimate saving withdraw");
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
