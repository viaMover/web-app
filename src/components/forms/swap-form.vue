<template>
  <form>
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
      <asset-field
        :amount="output.amount"
        :asset="output.asset"
        :exclude-tokens="excludedOutputTokens"
        field-role="output"
        :label="$t('swaps.lblSwapTo')"
        :native-amount="output.nativeAmount"
        @update-amount="handleUpdateOutputAmount"
        @update-asset="handleUpdateOutputAsset"
        @update-native-amount="handleUpdateOutputNativeAmount"
      />
    </div>
    <div class="modal-wrapper-info-buttons">
      <button class="flip" type="button" @click="flipAssets">
        <img src="@/assets/images/flip.png" /><span>Flip</span>
      </button>
      <button
        class="swap-details"
        :class="{ disabled: !isSwapInfoAvailable }"
        type="button"
        @click="expandSwapInfo"
      >
        <img src="@/assets/images/swap-details.png" /><span>Swap Details</span>
      </button>
      <div v-if="swapInfoExpanded" class="swap-details__content">
        <div class="swap-details__content-item">
          <p class="description">Price impact</p>
          <p class="info up">0.31%</p>
        </div>
        <div class="swap-details__content-item">
          <p class="description">Minimum received</p>
          <p class="info">1.2731 AAVE</p>
        </div>
        <div class="swap-details__content-item">
          <p class="description">Rate</p>
          <p class="info">1 AAVE = 0.00036 ETH</p>
        </div>
        <div v-if="useSubsidized" class="swap-details__content-item">
          <p class="description">Smart Treasury cover</p>
          <p class="info">{{ swapNativePrice }}</p>
        </div>
        <div class="swap-details__content-item">
          <p class="description">Swapping via</p>
          <p class="info">Sushi <span>🍣</span></p>
        </div>
        <div class="swap-details__content-item">
          <p class="description">Slippage</p>
          <p class="info rate">{{ formatedSlippage }}%</p>
        </div>
      </div>
    </div>
    <div class="modal-wrapper-info-button">
      <action-button
        :button-class="buttonClass"
        :disabled="!swapAvaialble"
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
</template>

<script lang="ts">
import Vue from 'vue';

import { TokenWithBalance, Token } from '@/wallet/types';

import { AssetField, GasSelector } from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import { GasMode, GasModeData } from '@/components/controls/gas-selector.vue';

import { estimateSwapCompound } from '@/wallet/actions/swap/swapEstimate';
import { swapCompound } from '@/wallet/actions/swap/swap';
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
  multiply,
  notZero,
  toWei
} from '@/utils/bigmath';
import { GetTokenPrice } from '@/services/thegraph/api';
import { sameAddress } from '@/utils/address';
import Web3 from 'web3';
import { formatPercents } from '@/utils/format';

export default Vue.extend({
  name: 'SwapForm',
  components: {
    AssetField,
    ActionButton,
    GasSelector
  },
  data() {
    return {
      swapInfoExpanded: false,
      info: {
        minimumReceived: 0,
        rate: 0,
        estimatedNetworkFee: 0,
        smartTreasuryCover: 0,
        slippage: 0,
        gasSettings: null
      },
      input: {
        asset: undefined as TokenWithBalance | undefined,
        amount: '',
        nativeAmount: ''
      },
      output: {
        asset: undefined as Token | undefined,
        amount: '',
        nativeAmount: ''
      },
      slippage: '1',
      selectedGasPrice: '0',
      useSubsidized: false,
      swapGasLimit: '0',
      approveGasLimit: '0',
      transferData: undefined as TransferData | undefined,
      loading: false,
      error: undefined as string | undefined
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
    swapAvaialble(): boolean {
      return (
        this.error === undefined &&
        !this.loading &&
        this.transferData !== undefined &&
        this.input.asset !== undefined &&
        this.output.asset !== undefined
      );
    },
    actionButtonText(): string {
      if (this.loading) {
        return 'Loading';
      }
      if (this.error !== undefined) {
        return this.error;
      }
      if (this.input.asset === undefined || this.output.asset === undefined) {
        return 'Choose Token';
      }
      if (!notZero(this.input.amount)) {
        return 'Enter Amount';
      }
      return 'Swap';
    },
    availableGasModes(): Array<GasMode> {
      return ['low', 'normal', 'high', 'treasury'];
    },
    formatedSlippage(): string {
      return formatPercents(this.slippage);
    },
    allGasLimit(): string {
      console.log(
        'all gas limit: ',
        add(this.approveGasLimit, this.swapGasLimit)
      );
      return add(this.approveGasLimit, this.swapGasLimit);
    },
    swapNativePrice(): string {
      const selectedGasPriceInWEI = Web3.utils.toWei(
        this.selectedGasPrice,
        'Gwei'
      );
      const swapPriceInWEI = multiply(selectedGasPriceInWEI, this.swapGasLimit);

      const swapPriceInEth = Web3.utils.fromWei(swapPriceInWEI, 'ether');
      const swapPriceNative = multiply(swapPriceInEth, this.ethPrice);

      return `$${swapPriceNative}`;
    },
    maxInputAmount(): string {
      return this.input.asset !== undefined ? this.input.asset.balance : '0';
    },
    buttonClass(): string {
      if (this.swapAvaialble) {
        return 'button active';
      } else {
        return 'button inactive';
      }
    },
    isSwapInfoAvailable(): boolean {
      return !!this.transferData;
    },
    excludedOutputTokens(): Array<Token> {
      if (this.input.asset === undefined) {
        return [];
      }

      return [this.input.asset];
    }
  },
  mounted() {
    this.selectedGasPrice = this.gasPrices?.ProposeGas.price ?? '0';
  },
  methods: {
    expandSwapInfo(): void {
      this.swapInfoExpanded = !this.swapInfoExpanded;
    },
    async handleExecuteSwap(): Promise<void> {
      //
      if (this.transferData === undefined) {
        console.error(
          "[swap-form] can't execute swap due to empty transfer data"
        );
        return;
      }
      if (this.input.asset === undefined) {
        console.error(
          "[swap-form] can't execute swap due to empty input asset"
        );
        return;
      }
      if (this.output.asset === undefined) {
        console.error(
          "[swap-form] can't execute swap due to empty output asset"
        );
        return;
      }
      await swapCompound(
        this.input.asset,
        this.output.asset,
        this.input.amount,
        this.transferData,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress,
        this.swapGasLimit,
        this.approveGasLimit,
        this.selectedGasPrice,
        this.useSubsidized
      );
      //this.$emit('tx-created', 'transaction-hash');
    },
    async flipAssets(): Promise<void> {
      const inputAsset = this.input.asset;
      const outputAsset = this.output.asset;

      if (inputAsset !== undefined) {
        this.output.asset = inputAsset;
        this.output.amount = '0';
        this.output.nativeAmount = '0';
      }

      if (outputAsset !== undefined) {
        this.input.asset = { ...outputAsset, balance: '0' };
        this.input.amount = '0';
        this.input.nativeAmount = '0';

        const assetInWallet: TokenWithBalance = this.tokens.find(
          (t: TokenWithBalance) => sameAddress(t.address, outputAsset.address)
        );

        if (assetInWallet !== undefined) {
          this.input.asset.balance = assetInWallet.balance;
        } else {
          this.input.asset.balance = '0';
        }
      }

      this.swapGasLimit = '0';
      return;
    },
    async handleUpdateInputAmount(amount: string): Promise<void> {
      this.input.amount = amount;
      if (this.input.asset === undefined || this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.input.amount)) {
        this.input.nativeAmount = '0';
        this.output.amount = '0';
        this.output.nativeAmount = '0';
        return;
      }

      this.loading = true;
      try {
        this.input.nativeAmount = multiply(
          this.input.asset.priceUSD,
          this.input.amount
        );

        const transferData = await this.calcData(
          this.input.asset,
          this.output.asset,
          this.input.amount,
          true
        );

        this.output.amount = fromWei(
          transferData.buyAmount,
          this.output.asset.decimals
        );
        this.output.nativeAmount = multiply(
          this.output.asset.priceUSD,
          this.output.amount
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          this.output.asset,
          transferData
        );
      } catch (err) {
        if (err instanceof ZeroXSwapError) {
          this.error = err.publicMessage;
        }
        console.error(`can't calc data: ${err}`);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateInputNativeAmount(amount: string): Promise<void> {
      this.input.nativeAmount = amount;
      if (this.input.asset === undefined || this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.input.amount)) {
        this.input.amount = '0';
        this.output.amount = '0';
        this.output.nativeAmount = '0';
        return;
      }

      this.loading = true;
      try {
        this.input.amount = divide(
          this.input.nativeAmount,
          this.input.asset.priceUSD
        );

        const transferData = await this.calcData(
          this.input.asset,
          this.output.asset,
          this.input.amount,
          true
        );

        this.output.amount = fromWei(
          transferData.buyAmount,
          this.output.asset.decimals
        );
        this.output.nativeAmount = multiply(
          this.output.asset.priceUSD,
          this.output.amount
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          this.output.asset,
          transferData
        );
      } catch (err) {
        if (err instanceof ZeroXSwapError) {
          this.error = err.publicMessage;
        }
        console.error(`can't calc data: ${err}`);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateOutputAmount(amount: string): Promise<void> {
      this.output.amount = amount;

      if (this.input.asset === undefined || this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.output.amount)) {
        this.input.amount = '0';
        this.input.nativeAmount = '0';
        this.output.nativeAmount = '0';
        return;
      }

      this.loading = true;
      try {
        this.output.nativeAmount = multiply(
          this.output.asset.priceUSD,
          this.output.amount
        );

        const transferData = await this.calcData(
          this.input.asset,
          this.output.asset,
          this.output.amount,
          false
        );

        this.input.amount = fromWei(
          transferData.sellAmount,
          this.output.asset.decimals
        );
        this.input.nativeAmount = multiply(
          this.input.asset.priceUSD,
          this.input.amount
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          this.output.asset,
          transferData
        );
      } catch (err) {
        if (err instanceof ZeroXSwapError) {
          this.error = err.publicMessage;
        }
        console.error(`can't calc data: ${err}`);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateOutputNativeAmount(amount: string): Promise<void> {
      this.output.nativeAmount = amount;
      if (this.input.asset === undefined || this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.output.nativeAmount)) {
        this.input.amount = '0';
        this.input.nativeAmount = '0';
        this.output.amount = '0';
        return;
      }

      this.loading = true;
      try {
        this.output.amount = divide(
          this.output.nativeAmount,
          this.output.asset.priceUSD
        );

        const transferData = await this.calcData(
          this.input.asset,
          this.output.asset,
          this.output.amount,
          false
        );

        this.input.amount = fromWei(
          transferData.sellAmount,
          this.output.asset.decimals
        );
        this.input.nativeAmount = multiply(
          this.input.asset.priceUSD,
          this.input.amount
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          this.output.asset,
          transferData
        );
      } catch (err) {
        if (err instanceof ZeroXSwapError) {
          this.error = err.publicMessage;
        }
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
      this.output.amount = '';
      this.output.nativeAmount = '';

      this.swapGasLimit = '0';
    },
    async handleUpdateOutputAsset(asset: Token): Promise<void> {
      const price = await GetTokenPrice(asset.address);
      this.output.asset = { ...asset, priceUSD: price };
      this.input.amount = '';
      this.input.nativeAmount = '';
      this.output.amount = '';
      this.output.nativeAmount = '';

      this.swapGasLimit = '0';
    },
    handleSelectedGasChanged(newGas: GasModeData): void {
      this.useSubsidized = newGas.mode === 'treasury';
      this.selectedGasPrice = String(newGas.price);
    },
    async calcData(
      inputAsset: Token,
      outputAsset: Token,
      amount: string,
      isInput: boolean
    ): Promise<TransferData> {
      const inputInWei = toWei(
        amount,
        isInput ? inputAsset.decimals : outputAsset.decimals
      );
      const transferData = await getTransferData(
        outputAsset.address,
        inputAsset.address,
        inputInWei,
        isInput,
        this.networkInfo.network
      );
      this.transferData = transferData;
      return transferData;
    },
    async tryToEstimate(
      inputAmount: string,
      inputAsset: Token,
      outputAsset: Token,
      transferData: TransferData
    ): Promise<void> {
      const resp = await estimateSwapCompound(
        inputAsset,
        outputAsset,
        inputAmount,
        transferData,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress,
        this.useSubsidized
      );

      if (resp.error) {
        console.error("can't esitmate swap");
        return;
      }

      this.swapGasLimit = resp.swapGasLimit;
      this.approveGasLimit = resp.approveGasLimit;
    }
  }
});
</script>
