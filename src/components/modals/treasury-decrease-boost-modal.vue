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
          :asset="output.asset"
          field-role="input"
          :force-token-array="availableTokens"
          :label="$t('swaps.lblSwapFrom')"
          :max-amount="maxOutputAmount"
          :native-amount="output.nativeAmount"
          @update-amount="handleUpdateOutputAmount"
          @update-asset="handleUpdateOutputAsset"
          @update-native-amount="handleUpdateOutputNativeAmount"
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
          <span>Transaction Details</span>
        </button>
        <div v-if="showInfo" class="tx-details__content">
          <div class="tx-details__content-item">
            <p class="description">New smart treasury boost</p>
            <div class="value">
              <span>{{ newBoost }}</span>
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

import { GasData, SmallToken, TokenWithBalance } from '@/wallet/types';

import { AssetField, FormLoader, GasSelector } from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import { GasMode, GasModeData } from '@/components/controls/gas-selector.vue';

import { mapGetters, mapState } from 'vuex';
import {
  add,
  convertAmountFromNativeValue,
  convertNativeAmountFromAmount,
  greaterThan,
  multiply,
  notZero,
  sub
} from '@/utils/bigmath';
import {
  getAssetsForTreasury,
  getMoveAssetData,
  getMoveWethLPAssetData
} from '@/wallet/references/data';
import { withdrawCompound } from '@/wallet/actions/treasury/withdraw/withdraw';
import { estimateWithdrawCompound } from '@/wallet/actions/treasury/withdraw/withdrawEstimate';
import { formatToDecimals } from '@/utils/format';
import { sameAddress } from '@/utils/address';
import { GetTokenPrice } from '@/services/thegraph/api';
import * as Sentry from '@sentry/vue';
import {
  Modal as ModalType,
  TModalPayload
} from '@/store/modules/modals/types';

import Modal from './modal.vue';
import { Step } from '../controls/form-loader';
import { calcTreasuryBoost } from '@/store/modules/account/utils/treasury';
import { Properties as CssProperties } from 'csstype';
import DetailsPicture from '@/components/modals/details-picture.vue';

export default Vue.extend({
  name: 'TreasuryDecreaseBoostModal',
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
        asset: undefined as TokenWithBalance | undefined,
        amount: '',
        nativeAmount: ''
      },
      selectedGasPrice: '0',
      actionGasLimit: '0',
      approveGasLimit: '0',
      transferError: undefined as undefined | string,
      loading: false,
      modalId: ModalType.TreasuryDecreaseBoost
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
      'ethPrice',
      'treasuryBalanceMove',
      'treasuryBalanceLP'
    ]),
    ...mapState('modals', {
      state: 'state'
    }),
    ...mapGetters('account', [
      'moveNativePrice',
      'slpNativePrice',
      'getTokenColor'
    ]),
    headerLabel(): string | undefined {
      return this.loaderStep ? undefined : 'Decrease Boost';
    },
    modalPayload(): boolean {
      return this.state[this.modalId].payload;
    },
    availableTokens(): Array<TokenWithBalance> {
      const treasuryTokens = getAssetsForTreasury(
        this.networkInfo.network,
        this.moveNativePrice,
        this.slpNativePrice
      );
      return treasuryTokens
        .map((t) => ({
          ...t,
          balance: this.getTreasuryTokenBalance(t.address)
        }))
        .filter((t) => greaterThan(t.balance, '0'));
    },
    error(): string | undefined {
      if (!notZero(this.output.amount)) {
        return 'Enter Amount';
      }

      if (greaterThan(this.output.amount, this.maxOutputAmount)) {
        return 'Insufficient Balance';
      }

      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    },
    newBoost(): string {
      if (this.output.asset === undefined) {
        return '';
      }

      const move = getMoveAssetData(this.networkInfo.network);
      const slp = getMoveWethLPAssetData(this.networkInfo.network);

      let walletBalanceMove =
        this.tokens.find((t: TokenWithBalance) =>
          sameAddress(t.address, move.address)
        )?.balance ?? '0';

      let walletBalanceLP =
        this.tokens.find((t: TokenWithBalance) =>
          sameAddress(t.address, slp.address)
        )?.balance ?? '0';

      let treasuryBalanceMove = this.treasuryBalanceMove;
      let treasuryBalanceLP = this.treasuryBalanceLP;

      if (sameAddress(this.output.asset.address, move.address)) {
        let inputedAmount = this.output.amount || '0';
        if (greaterThan(inputedAmount, treasuryBalanceMove)) {
          inputedAmount = treasuryBalanceMove;
        }
        walletBalanceMove = add(walletBalanceMove, inputedAmount);
        treasuryBalanceMove = sub(treasuryBalanceMove, inputedAmount);
      } else if (sameAddress(this.output.asset.address, slp.address)) {
        let inputedAmount = this.output.amount || '0';
        if (greaterThan(inputedAmount, treasuryBalanceLP)) {
          inputedAmount = treasuryBalanceLP;
        }
        walletBalanceLP = add(walletBalanceLP, inputedAmount);
        treasuryBalanceLP = sub(treasuryBalanceLP, inputedAmount);
      }

      const futureBoost = calcTreasuryBoost(
        treasuryBalanceMove,
        treasuryBalanceLP,
        walletBalanceMove,
        walletBalanceLP
      );

      return `${formatToDecimals(futureBoost, 1)}x`;
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

      return '📉 Decrease Boost';
    },
    availableGasModes(): Array<GasMode> {
      return ['low', 'normal', 'high'];
    },
    allGasLimit(): string {
      console.log(
        'all gas limit: ',
        add(this.approveGasLimit, this.actionGasLimit)
      );
      return add(this.approveGasLimit, this.actionGasLimit);
    },
    maxOutputAmount(): string {
      if (this.output.asset === undefined) {
        return '0';
      }
      return this.getTreasuryTokenBalance(this.output.asset.address);
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
    infoFooter(): string {
      return 'Decrease the boost will return your reserved assets, but will also decrease your Treasury share and future rewards.';
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
      }
    },
    modalPayload(
      newVal: TModalPayload<ModalType.TreasuryDecreaseBoost> | undefined
    ) {
      if (newVal === undefined) {
        return;
      }

      this.loaderStep = undefined;
      this.infoExpanded = false;
      this.loading = false;
      this.transferError = undefined;
      this.actionGasLimit = '0';
      this.approveGasLimit = '0';

      const move = this.availableTokens.find((t: TokenWithBalance) =>
        sameAddress(
          t.address,
          getMoveAssetData(this.networkInfo.network).address
        )
      );
      if (move) {
        this.output.asset = move;
      } else {
        if (this.availableTokens.length > 0) {
          this.output.asset = this.availableTokens[0];
        } else {
          this.output.asset = undefined;
        }
      }
      this.output.amount = '';
      this.output.nativeAmount = '';

      this.selectedGasPrice = this.gasPrices?.ProposeGas.price ?? '0';
    }
  },
  methods: {
    getTreasuryTokenBalance(address: string): string {
      const move = getMoveAssetData(this.networkInfo.network);
      const slp = getMoveWethLPAssetData(this.networkInfo.network);

      if (sameAddress(address, move.address)) {
        return this.treasuryBalanceMove;
      } else if (sameAddress(address, slp.address)) {
        return this.treasuryBalanceLP;
      }
      return '0';
    },
    expandInfo(): void {
      this.infoExpanded = !this.infoExpanded;
    },
    async handleExecuteWithdraw(): Promise<void> {
      if (this.output.asset === undefined) {
        console.error(
          "[withdraw-form] can't execute withdraw due to empty input asset"
        );
        return;
      }
      if (!notZero(this.output.amount)) {
        console.error(
          "[withdraw-form] can't execute withdraw due to zero amount"
        );
        return;
      }

      this.loaderStep = 'Confirm';
      try {
        await withdrawCompound(
          this.output.asset,
          this.output.amount,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          this.actionGasLimit,
          this.selectedGasPrice,
          async () => {
            this.loaderStep = 'Process';
          }
        );
        this.loaderStep = 'Success';
      } catch (err) {
        this.loaderStep = 'Reverted';
        Sentry.captureException(err);
      }
    },
    async handleUpdateOutputAsset(asset: TokenWithBalance): Promise<void> {
      const price = await GetTokenPrice(asset.address);
      this.output.asset = asset;
      if (!this.output.asset.priceUSD && price !== '0') {
        this.output.asset.priceUSD = price;
      }
      this.output.amount = '';
      this.output.nativeAmount = '';

      this.actionGasLimit = '0';
    },
    async handleUpdateOutputAmount(amount: string): Promise<void> {
      this.output.amount = amount;

      if (this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.output.amount)) {
        this.output.nativeAmount = '0';
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        this.output.nativeAmount = convertNativeAmountFromAmount(
          this.output.amount,
          this.output.asset.priceUSD
        );

        await this.tryToEstimate(this.output.amount, this.output.asset);
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

      if (this.output.asset === undefined) {
        return;
      }

      if (!notZero(this.output.nativeAmount)) {
        this.output.amount = '0';
        return;
      }

      this.loading = true;
      this.transferError = undefined;
      try {
        this.output.amount = convertAmountFromNativeValue(
          this.output.nativeAmount,
          this.output.asset.priceUSD,
          this.output.asset.decimals
        );

        await this.tryToEstimate(this.output.amount, this.output.asset);
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
      this.selectedGasPrice = String(newGas.price);
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
        Sentry.captureException("can't estimate treasury withdraw");
        return;
      }
      this.actionGasLimit = resp.actionGasLimit;
      this.approveGasLimit = resp.approveGasLimit;
    }
  }
});
</script>
