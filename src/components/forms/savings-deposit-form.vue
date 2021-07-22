<template>
  <div class="modal__wrapper-info">
    <div>
      <h3 v-if="headerLabel" class="modal__wrapper-info-title">
        {{ headerLabel }}
      </h3>
      <span v-else>&nbsp;</span>
    </div>
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
          <img src="@/assets/images/swap-details.png" />
          <span>Deposit Details</span>
        </button>
        <div v-if="showInfo" class="tx-details__content">
          <div class="tx-details__content-item">
            <p class="description">Swapping for</p>
            <p class="info up">{{ swappingForString }}</p>
          </div>
          <div class="tx-details__content-item">
            <p class="description">Estimated annual earnings</p>
            <p class="info">{{ estimatedAnnualEarning }}</p>
          </div>
        </div>
      </div>
      <div class="modal-wrapper-info-button">
        <action-button
          :button-class="buttonClass"
          :disabled="!actionAvaialble"
          :text="actionButtonText"
          @button-click="handleExecuteSwap"
        />
      </div>
      <gas-selector
        :approve-gas-limit="approveGasLimit"
        :avaialble-gas-modes="availableGasModes"
        :txn-gas-limit="allGasLimit"
        @selected-gas-changed="handleSelectedGasChanged"
      />
    </form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { TokenWithBalance, SmallTokenInfo, SmallToken } from '@/wallet/types';

import { AssetField, GasSelector, FormLoader } from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import { GasMode, GasModeData } from '@/components/controls/gas-selector.vue';

import {
  getTransferData,
  TransferData,
  ZeroXSwapError
} from '@/services/0x/api';
import { mapState } from 'vuex';
import {
  add,
  divide,
  fromWei,
  greaterThan,
  multiply,
  notZero,
  toWei
} from '@/utils/bigmath';
import { GetTokenPrice } from '@/services/thegraph/api';
import { Step } from '../controls/form-loader.vue';
import { getUSDCAssetData } from '@/wallet/references/data';

export default Vue.extend({
  name: 'SavingsDepositForm',
  components: {
    AssetField,
    ActionButton,
    GasSelector,
    FormLoader
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
      depositGasLimit: '0',
      approveGasLimit: '0',
      transferData: undefined as TransferData | undefined,
      transferError: undefined as undefined | string,
      loading: false
    };
  },
  computed: {
    ...mapState('account', [
      'networkInfo',
      'currentAddress',
      'provider',
      'gasPrices',
      'tokens',
      'ethPrice'
    ]),
    outputUSDCAsset(): SmallTokenInfo {
      return getUSDCAssetData(this.networkInfo.network);
    },
    headerLabel(): string | undefined {
      return this.loaderStep ? undefined : 'Deposit';
    },
    error(): string | undefined {
      if (this.input.asset === undefined) {
        return 'Choose Token';
      }

      if (!notZero(this.input.amount)) {
        return 'Enter Amount';
      }

      if (greaterThan(this.input.amount, this.input.asset.balance)) {
        return 'Inssuficient Balance';
      }

      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    },
    estimatedAnnualEarning(): string {
      if (this.transferData === undefined) {
        return '';
      }
      return '$??';
    },
    swappingForString(): string {
      if (this.transferData === undefined || this.input.asset === undefined) {
        return '';
      }

      const buyedUSDC = fromWei(
        this.transferData.buyAmount,
        this.outputUSDCAsset.decimals
      );

      return `${buyedUSDC} ${this.outputUSDCAsset.symbol}`;
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

      return 'Deposit';
    },
    availableGasModes(): Array<GasMode> {
      return ['low', 'normal', 'high', 'treasury'];
    },
    allGasLimit(): string {
      console.log(
        'all gas limit: ',
        add(this.approveGasLimit, this.depositGasLimit)
      );
      return add(this.approveGasLimit, this.depositGasLimit);
    },
    maxInputAmount(): string {
      return this.input.asset !== undefined ? this.input.asset.balance : '0';
    },
    buttonClass(): string {
      if (this.actionAvaialble) {
        return 'button active';
      } else {
        return 'button inactive';
      }
    },
    isInfoAvailable(): boolean {
      return !!this.transferData;
    },
    showInfo(): boolean {
      return this.infoExpanded && !this.loading && !!this.transferData;
    }
  },
  mounted() {
    this.selectedGasPrice = this.gasPrices?.ProposeGas.price ?? '0';
  },
  methods: {
    expandInfo(): void {
      this.infoExpanded = !this.infoExpanded;
    },
    async handleExecuteSwap(): Promise<void> {
      if (this.input.asset === undefined) {
        console.error(
          "[deposit-form] can't execute deposit due to empty input asset"
        );
        return;
      }

      this.loaderStep = 'Confirm';
      try {
        // await swapCompound(
        //   this.input.asset,
        //   this.output.asset,
        //   this.input.amount,
        //   this.transferData,
        //   this.networkInfo.network,
        //   this.provider.web3,
        //   this.currentAddress,
        //   this.swapGasLimit,
        //   this.approveGasLimit,
        //   this.selectedGasPrice,
        //   this.useSubsidized,
        //   async () => {
        //     this.loaderStep = 'Process';
        //   }
        // );
        this.loaderStep = 'Success';
      } catch (err) {
        this.loaderStep = 'Reverted';
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
        this.input.nativeAmount = multiply(
          this.input.asset.priceUSD,
          this.input.amount
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
          this.transferError = err.publicMessage;
        } else {
          console.error(`can't calc data: ${err}`);
          this.transferError = 'Exchange error';
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

      if (!notZero(this.input.amount)) {
        this.input.amount = '0';
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        this.input.amount = divide(
          this.input.nativeAmount,
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
          this.transferError = err.publicMessage;
        } else {
          console.error(`can't calc data: ${err}`);
          this.transferError = 'Exchange error';
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
      if (!price && price !== '0') {
        this.input.asset.priceUSD = price;
      }
      this.input.amount = '';
      this.input.nativeAmount = '';

      this.depositGasLimit = '0';
      this.transferData = undefined;
    },
    handleSelectedGasChanged(newGas: GasModeData): void {
      this.useSubsidized = newGas.mode === 'treasury';
      this.selectedGasPrice = String(newGas.price);
    },
    async calcData(
      inputAsset: SmallToken,
      amount: string
    ): Promise<TransferData> {
      const inputInWei = toWei(amount, inputAsset.decimals);
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
      transferData: TransferData
    ): Promise<void> {
      // const resp = await estimateSwapCompound(
      //   inputAsset,
      //   this.outputUSDCAsset,
      //   inputAmount,
      //   transferData,
      //   this.networkInfo.network,
      //   this.provider.web3,
      //   this.currentAddress,
      //   this.useSubsidized
      // );
      // if (resp.error) {
      //   console.error(resp.error);
      //   this.transferError = 'Estimate error';
      //   return;
      // }
      // this.depositGasLimit = resp.swapGasLimit;
      //this.approveGasLimit = resp.approveGasLimit;
    }
  }
});
</script>
