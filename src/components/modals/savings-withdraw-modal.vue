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
          <picture>
            <source
              srcset="
                @/assets/images/Details.webp,
                @/assets/images/Details@2x.webp 2x
              "
              type="image/webp"
            />
            <img
              :alt="$t('icon.txtSwapDetailsIconAlt')"
              src="@/assets/images/Details.png"
              srcset="
                @/assets/images/Details.png,
                @/assets/images/Details@2x.png 2x
              "
            />
          </picture>
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

import {
  TokenWithBalance,
  SmallToken,
  SmallTokenInfoWithIcon,
  GasData
} from '@/wallet/types';

import { AssetField, GasSelector, FormLoader } from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import { GasMode, GasModeData } from '@/components/controls/gas-selector.vue';
import Web3 from 'web3';
import { mapGetters, mapState } from 'vuex';
import {
  add,
  convertAmountFromNativeValue,
  divide,
  greaterThan,
  isZero,
  multiply,
  notZero
} from '@/utils/bigmath';
import { Step } from '@/components/controls/form-loader';
import { getUSDCAssetData } from '@/wallet/references/data';
import { withdrawCompound } from '@/wallet/actions/savings/withdraw/withdraw';
import { estimateWithdrawCompound } from '@/wallet/actions/savings/withdraw/withdrawEstimate';
import { formatToNative } from '@/utils/format';
import { isSubsidizedAllowed } from '@/wallet/actions/subsidized';
import Modal from './modal.vue';
import {
  Modal as ModalTypes,
  TModalPayload
} from '@/store/modules/modals/types';

export default Vue.extend({
  name: 'SavingsWithdrawModal',
  components: {
    AssetField,
    ActionButton,
    GasSelector,
    FormLoader,
    Modal
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
    ...mapGetters('account', ['usdcNativePrice', 'treasuryBonusNative']),
    outputUSDCToken(): TokenWithBalance {
      return {
        address: this.outputUSDCAsset.address,
        decimals: this.outputUSDCAsset.decimals,
        symbol: this.outputUSDCAsset.symbol,
        name: 'USDC',
        priceUSD: this.usdcNativePrice,
        logo: this.outputUSDCAsset.iconURL,
        isFavorite: true,
        isVerified: true,
        balance: this.savingsBalance
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
        return 'Enter Amount';
      }

      if (greaterThan(this.output.amount, this.maxOutputAmount)) {
        return 'Inssuficient Balance';
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
      this.output.amount = '';
      this.output.nativeAmount = '';
      this.selectedGasPrice = this.gasPrices?.ProposeGas.price ?? '0';
      this.checkSubsidizedAvailability();
    }
  },
  mounted() {
    this.selectedGasPrice = this.gasPrices?.ProposeGas.price ?? '0';
    this.checkSubsidizedAvailability();
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
          this.selectedGasPrice,
          this.useSubsidized,
          async () => {
            this.loaderStep = 'Process';
          }
        );
        this.loaderStep = 'Success';
      } catch (err) {
        this.loaderStep = 'Reverted';
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
        this.output.nativeAmount = multiply(
          this.usdcNativePrice,
          this.output.amount
        );

        console.log('this.usdcNativePrice', this.usdcNativePrice);

        await this.tryToEstimate(this.output.amount, this.outputUSDCAsset);
      } catch (err) {
        console.error(`can't calc data: ${err}`);
        this.transferError = 'Exchange error';
        console.error(`can't calc data: ${err}`);
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
        console.error(`can't calc data: ${err}`);
        this.transferError = 'Exchange error';
        console.error(`can't calc data: ${err}`);
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
