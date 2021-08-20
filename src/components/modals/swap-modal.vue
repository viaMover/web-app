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
          has-couple-tokens
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
          has-couple-tokens
          :label="$t('swaps.lblSwapTo')"
          :native-amount="output.nativeAmount"
          show-token-balance
          @update-amount="handleUpdateOutputAmount"
          @update-asset="handleUpdateOutputAsset"
          @update-native-amount="handleUpdateOutputNativeAmount"
        />
      </div>
      <div class="modal-wrapper-info-buttons">
        <button class="flip button-active" type="button" @click="flipAssets">
          <picture>
            <source
              srcset="
                @/assets/images/Flip.webp,
                @/assets/images/Flip@2x.webp 2x
              "
              type="image/webp"
            />
            <img
              :alt="$t('icon.txtFlipAssetsIconAlt')"
              src="@/assets/images/Flip.png"
              srcset="@/assets/images/Flip.png, images/Flip@2x.png 2x"
            />
          </picture>
          <span>Flip</span>
        </button>
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
          <span>Swap Details</span>
        </button>
        <div v-if="showInfo" class="tx-details__content">
          <div class="tx-details__content-item">
            <p class="description">Minimum received</p>
            <div class="value">
              <span>{{ minimalReceived }}</span>
            </div>
          </div>
          <div class="tx-details__content-item">
            <p class="description">Rate</p>
            <div class="value">
              <span>{{ rateString }}</span>
            </div>
          </div>
          <div class="tx-details__content-item">
            <p class="description">Smart Treasury cover</p>
            <div class="value">
              <span>{{ treasuryCover }}</span>
            </div>
          </div>
          <div class="tx-details__content-item">
            <p class="description">Swapping via</p>
            <div class="value">
              <span>{{ swappingVia }}</span>
            </div>
          </div>
          <div class="tx-details__content-item">
            <p class="description">Slippage</p>
            <slippage-selector
              :slippage="slippage"
              @selected-slippage-changed="handleSelectedSlippageChanged"
            />
          </div>
        </div>
      </div>
      <div class="modal-wrapper-info-button">
        <action-button
          :button-class="buttonClass"
          :custom-style="actionButtonStyle"
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
  </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import Web3 from 'web3';
import { mapGetters, mapState } from 'vuex';
import { estimateSwapCompound } from '@/wallet/actions/swap/swapEstimate';
import { swapCompound } from '@/wallet/actions/swap/swap';
import {
  getTransferData,
  TransferData,
  ZeroXSwapError
} from '@/services/0x/api';
import { mapError } from '@/services/0x/errors';
import {
  add,
  convertAmountFromNativeValue,
  divide,
  fromWei,
  greaterThan,
  isZero,
  multiply,
  notZero,
  sub,
  toWei
} from '@/utils/bigmath';
import { formatToDecimals, formatToNative } from '@/utils/format';
import { formatSwapSources, getMoveAssetData } from '@/wallet/references/data';
import { TokenWithBalance, Token, SmallToken, GasData } from '@/wallet/types';
import { GetTokenPrice } from '@/services/thegraph/api';
import { sameAddress } from '@/utils/address';

import {
  AssetField,
  GasSelector,
  SlippageSelector,
  FormLoader
} from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import { GasMode, GasModeData } from '@/components/controls/gas-selector.vue';
import { Slippage } from '../controls/slippage-selector.vue';
import { Step } from '@/components/controls/form-loader';
import ethDefaults from '@/wallet/references/defaults';
import { isSubsidizedAllowed } from '@/wallet/actions/subsidized';
import { Properties as CssProperties } from 'csstype';

import Modal from '@/components/modals/modal.vue';
import {
  Modal as ModalTypes,
  TModalPayload
} from '@/store/modules/modals/types';

export default Vue.extend({
  name: 'SwapModal',
  components: {
    AssetField,
    ActionButton,
    GasSelector,
    SlippageSelector,
    FormLoader,
    Modal
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
      output: {
        asset: undefined as Token | undefined,
        amount: '',
        nativeAmount: ''
      },
      slippage: '1',
      selectedGasPrice: '0',
      useSubsidized: false,
      subsidizedAvaialbe: false,
      actionGasLimit: ethDefaults.basic_holy_swap,
      approveGasLimit: '0',
      transferData: undefined as TransferData | undefined,
      transferError: undefined as undefined | string,
      loading: false,
      modalId: ModalTypes.Swap
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
      'allTokens'
    ]),
    ...mapState('modals', {
      state: 'state'
    }),
    ...mapGetters('account', ['treasuryBonusNative', 'getTokenColor']),
    headerLabel(): string | undefined {
      return this.loaderStep ? undefined : 'Swaps';
    },
    modalPayload(): boolean {
      return this.state[this.modalId].payload;
    },
    error(): string | undefined {
      if (this.input.asset === undefined || this.output.asset === undefined) {
        return 'Choose Token';
      }

      if (!notZero(this.input.amount)) {
        return 'Enter Amount';
      }

      if (greaterThan(this.input.amount, this.maxInputAmount)) {
        return 'Insufficient Balance';
      }

      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    },
    swappingVia(): string {
      if (this.transferData === undefined) {
        return '';
      }
      return formatSwapSources(this.transferData.swappingVia);
    },
    rateString(): string {
      if (
        this.transferData === undefined ||
        this.output.asset === undefined ||
        this.input.asset === undefined
      ) {
        return '';
      }

      let rate = divide(
        this.transferData.sellTokenToEthRate,
        this.transferData.buyTokenToEthRate
      );

      if (!notZero(rate)) {
        rate = divide(
          fromWei(this.transferData.sellAmount, this.input.asset.decimals),
          fromWei(this.transferData.buyAmount, this.output.asset.decimals)
        );
      }

      return `1 ${this.output.asset.symbol} = ${formatToDecimals(rate, 8)} ${
        this.input.asset.symbol
      }`;
    },
    selectedGasPriceInWEI(): string {
      return Web3.utils.toWei(this.selectedGasPrice, 'Gwei');
    },
    minimalReceived(): string {
      if (this.transferData === undefined || this.output.asset === undefined) {
        return '';
      }
      const minReceived = fromWei(
        this.transferData.buyAmount,
        this.output.asset.decimals
      );
      return `${formatToDecimals(minReceived, 8)} ${this.output.asset.symbol}`;
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

      if (greaterThan(this.approveGasLimit, '0')) {
        return '💸 Approve and Swap';
      }

      return '💸 Swap';
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
    treasuryCover(): string {
      const swapPriceInWEI = multiply(
        this.selectedGasPriceInWEI,
        this.actionGasLimit
      );

      const swapPriceInEth = Web3.utils.fromWei(swapPriceInWEI, 'ether');
      const swapPriceNative = multiply(swapPriceInEth, this.ethPrice);

      if (this.useSubsidized) {
        return `$${formatToNative(swapPriceNative)}`;
      } else {
        return '$0.00';
      }
    },
    maxInputAmount(): string {
      if (this.input.asset === undefined) {
        return '0';
      }
      if (this.input.asset.address === 'eth' && !this.useSubsidized) {
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
        return 'button active button-active';
      } else {
        return 'button inactive button-active';
      }
    },
    excludedOutputTokens(): Array<Token> {
      if (this.input.asset === undefined) {
        return [];
      }

      return [this.input.asset];
    },
    isInfoAvailable(): boolean {
      return !this.loading && !!this.transferData;
    },
    showInfo(): boolean {
      return this.infoExpanded && !this.loading && !!this.transferData;
    },
    toAssetColor(): string | undefined {
      if (this.output.asset === undefined) {
        return undefined;
      }
      return this.getTokenColor(this.output.asset.address);
    },
    actionButtonStyle(): CssProperties {
      if (this.actionAvaialble) {
        return {
          backgroundColor: this.toAssetColor ?? '#000'
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
    modalPayload(newVal: TModalPayload<ModalTypes.Swap> | undefined) {
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

      if (newVal.swapType === 'getMove') {
        const eth = this.tokens.find(
          (t: TokenWithBalance) => t.address === 'eth'
        );
        if (eth) {
          this.input.asset = eth;
          this.input.amount = '';
          this.input.nativeAmount = '';
        } else {
          this.input.asset = undefined;
          this.input.amount = '';
          this.input.nativeAmount = '';
        }
        const move = this.allTokens.find((t: TokenWithBalance) =>
          sameAddress(
            t.address,
            getMoveAssetData(this.networkInfo.network).address
          )
        );
        if (move) {
          this.output.asset = move;
          this.output.amount = '';
          this.output.nativeAmount = '';
        } else {
          this.output.asset = undefined;
          this.output.amount = '';
          this.output.nativeAmount = '';
        }
      } else {
        const eth = this.tokens.find(
          (t: TokenWithBalance) => t.address === 'eth'
        );
        if (eth) {
          this.input.asset = eth;
          this.input.amount = '';
          this.input.nativeAmount = '';
        } else {
          this.input.asset = undefined;
          this.input.amount = '';
          this.input.nativeAmount = '';
        }
        this.output.asset = undefined;
        this.output.amount = '';
        this.output.nativeAmount = '';
      }

      this.checkSubsidizedAvailability();
    }
  },
  methods: {
    expandInfo(): void {
      this.infoExpanded = !this.infoExpanded;
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

      this.loaderStep = 'Confirm';
      try {
        await swapCompound(
          this.input.asset,
          this.output.asset,
          this.input.amount,
          this.transferData,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          this.actionGasLimit,
          this.approveGasLimit,
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
    async flipAssets(): Promise<void> {
      this.loading = true;
      this.transferData = undefined;
      this.transferError = undefined;

      try {
        const inputAsset = this.input.asset;
        const outputAsset = this.output.asset;

        if (inputAsset !== undefined) {
          this.output.asset = inputAsset;
          this.output.amount = '';
          this.output.nativeAmount = '';
        } else {
          this.output.asset = undefined;
          this.output.amount = '';
          this.output.nativeAmount = '';
        }

        if (outputAsset !== undefined) {
          this.input.asset = { ...outputAsset, balance: '0' };
          this.input.amount = '';
          this.input.nativeAmount = '';

          const assetInWallet: TokenWithBalance = this.tokens.find(
            (t: TokenWithBalance) => sameAddress(t.address, outputAsset.address)
          );

          if (assetInWallet !== undefined) {
            this.input.asset.balance = assetInWallet.balance;
          } else {
            this.input.asset.balance = '0';
          }
        } else {
          this.input.asset = undefined;
          this.input.amount = '';
          this.input.nativeAmount = '';
        }

        this.actionGasLimit = ethDefaults.basic_holy_swap;
        this.approveGasLimit = '0';
      } finally {
        this.loading = false;
      }
      return;
    },
    async handleUpdateInputAmount(amount: string): Promise<void> {
      this.input.amount = amount;
      if (this.input.asset === undefined) {
        return;
      }

      if (!notZero(this.input.amount)) {
        this.input.nativeAmount = '0';
        this.output.amount = '0';
        this.output.nativeAmount = '0';
        return;
      }

      this.input.nativeAmount = formatToNative(
        multiply(this.input.asset.priceUSD, this.input.amount)
      );

      if (this.output.asset === undefined) {
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        const transferData = await this.calcData(
          this.input.asset,
          this.output.asset,
          this.input.amount,
          true,
          this.slippage
        );

        this.output.amount = fromWei(
          transferData.buyAmount,
          this.output.asset.decimals
        );
        this.output.nativeAmount = formatToNative(
          multiply(this.output.asset.priceUSD, this.output.amount)
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          this.output.asset,
          transferData
        );
      } catch (err) {
        if (err instanceof ZeroXSwapError) {
          this.transferError = mapError(err.publicMessage);
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

      if (!notZero(this.input.nativeAmount)) {
        this.input.amount = '0';
        this.output.amount = '0';
        this.output.nativeAmount = '0';
        return;
      }

      this.input.amount = convertAmountFromNativeValue(
        this.input.nativeAmount,
        this.input.asset.priceUSD,
        this.input.asset.decimals
      );

      if (this.output.asset === undefined) {
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        const transferData = await this.calcData(
          this.input.asset,
          this.output.asset,
          this.input.amount,
          true,
          this.slippage
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
          this.transferError = mapError(err.publicMessage);
        } else {
          console.error(`can't calc data: ${err}`);
          this.transferError = 'Swap error';
        }
        this.transferData = undefined;
        console.error(`can't calc data: ${err}`);
        return;
      } finally {
        this.loading = false;
      }
    },
    async handleUpdateOutputAmount(amount: string): Promise<void> {
      this.output.amount = amount;

      if (this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.output.amount)) {
        this.input.amount = '0';
        this.input.nativeAmount = '0';
        this.output.nativeAmount = '0';
        return;
      }

      this.output.nativeAmount = formatToNative(
        multiply(this.output.asset.priceUSD, this.output.amount)
      );

      if (this.input.asset === undefined) {
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        const transferData = await this.calcData(
          this.input.asset,
          this.output.asset,
          this.output.amount,
          false,
          this.slippage
        );

        this.input.amount = fromWei(
          transferData.sellAmount,
          this.input.asset.decimals
        );
        this.input.nativeAmount = formatToNative(
          multiply(this.input.asset.priceUSD, this.input.amount)
        );

        await this.tryToEstimate(
          this.input.amount,
          this.input.asset,
          this.output.asset,
          transferData
        );
      } catch (err) {
        if (err instanceof ZeroXSwapError) {
          this.transferError = mapError(err.publicMessage);
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
    async handleUpdateOutputNativeAmount(amount: string): Promise<void> {
      this.output.nativeAmount = amount;
      if (this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.output.nativeAmount)) {
        this.input.amount = '0';
        this.input.nativeAmount = '0';
        this.output.amount = '0';
        return;
      }

      this.output.amount = convertAmountFromNativeValue(
        this.output.nativeAmount,
        this.output.asset.priceUSD,
        this.output.asset.decimals
      );

      if (this.input.asset === undefined) {
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        const transferData = await this.calcData(
          this.input.asset,
          this.output.asset,
          this.output.amount,
          false,
          this.slippage
        );

        this.input.amount = fromWei(
          transferData.sellAmount,
          this.input.asset.decimals
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
          this.transferError = mapError(err.publicMessage);
        } else {
          console.error(`can't calc data: ${err}`);
          this.transferError = 'Exchange error';
        }
        this.transferData = undefined;

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

      this.actionGasLimit = ethDefaults.basic_holy_swap;
      this.transferData = undefined;
    },
    async handleUpdateOutputAsset(asset: Token): Promise<void> {
      const price = await GetTokenPrice(asset.address);
      this.output.asset = asset;
      if (!price && price !== '0') {
        this.output.asset.priceUSD = price;
      }
      this.input.amount = '';
      this.input.nativeAmount = '';
      this.output.amount = '';
      this.output.nativeAmount = '';

      this.actionGasLimit = ethDefaults.basic_holy_swap;
      this.transferData = undefined;
    },
    async handleSelectedSlippageChanged(newSlippage: Slippage): Promise<void> {
      this.slippage = newSlippage;

      if (this.input.asset === undefined || this.output.asset === undefined) {
        return;
      }
      try {
        const transferData = await this.calcData(
          this.input.asset,
          this.output.asset,
          this.input.amount,
          true,
          this.slippage
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
          this.transferError = mapError(err.publicMessage);
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
    handleSelectedGasChanged(newGas: GasModeData): void {
      this.useSubsidized = newGas.mode === 'treasury';
      this.selectedGasPrice = String(newGas.price);
      this.checkSubsidizedAvailability();
    },
    async calcData(
      inputAsset: SmallToken,
      outputAsset: SmallToken,
      amount: string,
      isInput: boolean,
      slippage: string
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
        slippage,
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

      if (
        this.input.asset?.address === 'eth' ||
        this.output.asset?.address === 'eth'
      ) {
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
