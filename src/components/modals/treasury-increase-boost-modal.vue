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
          treasury-only
          use-wallet-tokens
          @update-amount="handleUpdateInputAmount"
          @update-asset="handleUpdateInputAsset"
          @update-native-amount="handleUpdateInputNativeAmount"
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
        <p>
          There are two boost options. Reserving
          <span class="icon">
            <picture>
              <img
                alt=""
                src="@/assets/images/MOVE.png"
                srcset="
                  @/assets/images/MOVE.png,
                  @/assets/images/MOVE@2x.png 2x
                "
              />
            </picture>
          </span>
          MOVE tokens will increase (1x) your rewards share based on the total
          amount of the tokens you have reserved. Reserving
          <span class="icon-wrapper">
            <span class="icon-left">
              <picture>
                <img
                  alt=""
                  src="@/assets/images/MOVE.png"
                  srcset="
                    @/assets/images/MOVE.png,
                    @/assets/images/MOVE@2x.png 2x
                  "
                />
              </picture>
            </span>
            <span class="icon-right">
              <picture>
                <img
                  alt=""
                  src="@/assets/images/ETH.png"
                  srcset="
                    @/assets/images/ETH.png,
                    @/assets/images/ETH@2x.png 2x
                  "
                />
              </picture>
            </span>
          </span>
          MOVE-ETH LP tokens will multiply by 2,5 (2.5x) your rewards share
          based on the total amount of LP tokens you have reserved.
        </p>
      </div>
    </form>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue';

import { TokenWithBalance, SmallToken, GasData } from '@/wallet/types';

import { AssetField, GasSelector, FormLoader } from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import { GasMode, GasModeData } from '@/components/controls/gas-selector.vue';

import { mapGetters, mapState } from 'vuex';
import {
  add,
  convertAmountFromNativeValue,
  fromWei,
  greaterThan,
  multiply,
  notZero,
  sub
} from '@/utils/bigmath';
import { GetTokenPrice } from '@/services/thegraph/api';
import { Step } from '@/components/controls/form-loader';
import {
  getMoveAssetData,
  getMoveWethLPAssetData
} from '@/wallet/references/data';
import { depositCompound } from '@/wallet/actions/treasury/deposit/deposit';
import { estimateDepositCompound } from '@/wallet/actions/treasury/deposit/depositEstimate';
import { sameAddress } from '@/utils/address';
import { formatToDecimals, formatToNative } from '@/utils/format';
import { Properties as CssProperties } from 'csstype';
import * as Sentry from '@sentry/vue';
import Web3 from 'web3';
import {
  Modal as ModalType,
  TModalPayload
} from '@/store/modules/modals/types';

import Modal from './modal.vue';
import { calcTreasuryBoost } from '@/store/modules/account/utils/treasury';

export default Vue.extend({
  name: 'TreasuryIncreaseBoostModal',
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
      input: {
        asset: undefined as TokenWithBalance | undefined,
        amount: '',
        nativeAmount: ''
      },
      selectedGasPrice: '0',
      actionGasLimit: '0',
      approveGasLimit: '0',
      transferError: undefined as undefined | string,
      loading: false,
      modalId: ModalType.TreasuryIncreaseBoost
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
      'ethPrice',
      'treasuryBalanceMove',
      'treasuryBalanceLP'
    ]),
    ...mapState('modals', {
      state: 'state'
    }),
    ...mapGetters('account', ['getTokenColor']),
    headerLabel(): string | undefined {
      return this.loaderStep ? undefined : 'Increase Boost';
    },
    showFooter(): boolean {
      return this.input.asset === undefined || !notZero(this.input.amount);
    },
    modalPayload(): boolean {
      return this.state[this.modalId].payload;
    },
    error(): string | undefined {
      if (this.input.asset === undefined) {
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
    newBoost(): string {
      if (this.input.asset === undefined) {
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

      if (sameAddress(this.input.asset.address, move.address)) {
        let inputedAmount = this.input.amount || '0';
        if (greaterThan(inputedAmount, walletBalanceMove)) {
          inputedAmount = walletBalanceMove;
        }
        walletBalanceMove = sub(walletBalanceMove, inputedAmount);
        treasuryBalanceMove = add(treasuryBalanceMove, inputedAmount);
      } else if (sameAddress(this.input.asset.address, slp.address)) {
        let inputedAmount = this.input.amount || '0';
        if (greaterThan(inputedAmount, walletBalanceLP)) {
          inputedAmount = walletBalanceLP;
        }
        walletBalanceLP = sub(walletBalanceLP, inputedAmount);
        treasuryBalanceLP = add(treasuryBalanceLP, inputedAmount);
      }

      const futureBoost = calcTreasuryBoost(
        treasuryBalanceMove,
        treasuryBalanceLP,
        walletBalanceMove,
        walletBalanceLP
      );
      return `${formatToDecimals(futureBoost, 1)}x`;
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

      return '📈 Increase Boost';
    },
    selectedGasPriceInWEI(): string {
      return Web3.utils.toWei(this.selectedGasPrice, 'Gwei');
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
      return this.input.asset !== undefined && notZero(this.input.amount);
    },
    showInfo(): boolean {
      return this.infoExpanded && this.isInfoAvailable;
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
      newVal: TModalPayload<ModalType.TreasuryIncreaseBoost> | undefined
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

      const move = this.tokens.find((t: TokenWithBalance) =>
        sameAddress(
          t.address,
          getMoveAssetData(this.networkInfo.network).address
        )
      );
      if (move) {
        this.input.asset = move;
      } else {
        this.input.asset = undefined;
      }
      this.input.amount = '';
      this.input.nativeAmount = '';

      this.selectedGasPrice = this.gasPrices?.ProposeGas.price ?? '0';
    }
  },
  methods: {
    expandInfo(): void {
      this.infoExpanded = !this.infoExpanded;
    },
    async handleExecuteDeposit(): Promise<void> {
      if (this.input.asset === undefined) {
        console.error(
          "[deposit-form] can't execute deposit due to empty input asset"
        );
        return;
      }
      if (!notZero(this.input.amount)) {
        console.error(
          "[deposit-form] can't execute deposit due to zero amount"
        );
        return;
      }

      this.loaderStep = 'Confirm';
      try {
        await depositCompound(
          this.input.asset,
          this.input.amount,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          this.actionGasLimit,
          this.approveGasLimit,
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
        this.input.nativeAmount = formatToNative(
          multiply(this.input.asset.priceUSD, this.input.amount)
        );

        await this.tryToEstimate(this.input.amount, this.input.asset);
      } catch (err) {
        this.transferError = 'Estimate error';
        console.error(`can't calc data: ${err}`);
        Sentry.captureException(err);
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

        await this.tryToEstimate(this.input.amount, this.input.asset);
      } catch (err) {
        this.transferError = 'Estimate error';
        console.error(`can't calc data: ${err}`);
        Sentry.captureException(err);
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

      this.actionGasLimit = '0';
    },
    handleSelectedGasChanged(newGas: GasModeData): void {
      this.selectedGasPrice = String(newGas.price);
    },
    async tryToEstimate(
      inputAmount: string,
      inputAsset: SmallToken
    ): Promise<void> {
      const resp = await estimateDepositCompound(
        inputAsset,
        inputAmount,
        this.networkInfo.network,
        this.provider.web3,
        this.currentAddress
      );
      if (resp.error) {
        this.transferError = 'Estimate error';
        Sentry.captureException("can't estimate treasury deposit");
        return;
      }
      this.actionGasLimit = resp.actionGasLimit;
      this.approveGasLimit = resp.approveGasLimit;
    }
  }
});
</script>
