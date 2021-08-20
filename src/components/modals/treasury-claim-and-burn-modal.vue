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
          :force-token-array="availableTokens"
          :label="$t('swaps.lblSwapFrom')"
          :max-amount="maxInputAmount"
          :native-amount="input.nativeAmount"
          @update-amount="handleUpdateInputAmount"
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
            <p class="description">Claiming for</p>
            <div class="value">
              <div class="icon">
                <picture>
                  <img
                    alt=""
                    src="@/assets/images/USDC.png"
                    srcset="
                      @/assets/images/USDC.png,
                      @/assets/images/USDC@2x.png 2x
                    "
                    style="box-shadow: rgb(36, 116, 204) 0px 0px 8px"
                  />
                </picture>
              </div>
              <span>{{ claimingForStr }}</span>
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
          @button-click="handleExecuteClaimAndBurn"
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
          Claim &amp; Burn allows you to exchange your
          <span class="icon">
            <picture>
              <img
                alt=""
                src="@/assets/images/MOVE.png"
                srcset="
                  @/assets/images/MOVE.png,
                  @/assets/images/MOVE@2x.png 2x
                "
                style="box-shadow: 0px 0px 16px rgb(195, 236, 52)"
              />
            </picture>
          </span>
          MOVE tokens for a larger portion of the Smart Treasury. You will burn
          your MOVE tokens, and receive four times (4x) of your treasury share
          in a one-time payout.
        </p>
      </div>
    </form>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import { Properties } from 'csstype';

import { TokenWithBalance, SmallToken, GasData } from '@/wallet/types';
import {
  add,
  convertAmountFromNativeValue,
  greaterThan,
  multiply,
  notZero
} from '@/utils/bigmath';
import { GetTokenPrice } from '@/services/thegraph/api';
import { getMoveAssetData, getUSDCAssetData } from '@/wallet/references/data';
import { claimAndBurnCompound } from '@/wallet/actions/treasury/claimAndBurn/claimAndBurn';
import { estimateClaimAndBurnCompound } from '@/wallet/actions/treasury/claimAndBurn/claimAndBurnEstimate';
import { sameAddress } from '@/utils/address';
import { formatToDecimals, formatToNative } from '@/utils/format';
import { getExitingAmount, getMaxBurn } from '@/services/chain';
import {
  Modal as ModalType,
  TModalPayload
} from '@/store/modules/modals/types';

import { AssetField, GasSelector, FormLoader } from '@/components/controls';
import { ActionButton } from '@/components/buttons';
import { GasMode, GasModeData } from '@/components/controls/gas-selector.vue';
import { Step } from '@/components/controls/form-loader';
import Modal from './modal.vue';
import { Properties as CssProperties } from 'csstype';

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
      claimingFor: '0',
      selectedGasPrice: '0',
      actionGasLimit: '0',
      approveGasLimit: '0',
      transferError: undefined as undefined | string,
      maxBurnedAmount: undefined as undefined | string,
      loading: false,
      modalId: ModalType.TreasuryClaimAndBurn
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
    ...mapGetters('account', ['moveNativePrice', 'getTokenColor']),
    headerLabel(): string | undefined {
      return this.loaderStep ? undefined : 'Claim & Burn';
    },
    modalPayload(): boolean {
      return this.state[this.modalId].payload;
    },
    showFooter(): boolean {
      return this.input.asset === undefined || !notZero(this.input.amount);
    },
    availableTokens(): Array<TokenWithBalance> {
      const move = getMoveAssetData(this.networkInfo.network);
      const moveWalletBalance =
        this.tokens.find((t: TokenWithBalance) =>
          sameAddress(t.address, move.address)
        )?.balance ?? '0';

      if (greaterThan(moveWalletBalance, '0')) {
        return [
          {
            address: move.address,
            decimals: move.decimals,
            name: move.name,
            symbol: move.symbol,
            priceUSD: this.moveNativePrice,
            logo: move.iconURL,
            isFavorite: true,
            isVerified: true,
            balance: moveWalletBalance
          }
        ];
      }
      return [];
    },
    error(): string | undefined {
      if (this.input.asset === undefined) {
        return 'Choose Token';
      }

      if (!notZero(this.input.amount)) {
        return 'Enter Amount';
      }

      if (greaterThan(this.input.amount, this.maxInputAmount)) {
        return 'Insuficient Balance';
      }

      if (this.transferError !== undefined) {
        return this.transferError;
      }
      return undefined;
    },
    claimingForStr(): string {
      if (this.input.asset === undefined) {
        return '';
      }
      return `${formatToDecimals(this.claimingFor, 6)} ${
        getUSDCAssetData(this.networkInfo.network).symbol
      }`;
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

      return '🔥 Claim & Burn';
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
      return this.input.asset !== undefined && notZero(this.input.amount);
    },
    showInfo(): boolean {
      return this.infoExpanded && this.isInfoAvailable;
    },
    coinImageStyle(): Properties {
      return {
        boxShadow: 'rgb(182, 222, 49) 0px 0px 16px'
      };
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
    async modalPayload(
      newVal: TModalPayload<ModalType.TreasuryClaimAndBurn> | undefined
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

      this.loading = true;

      try {
        this.maxBurnedAmount = await getMaxBurn(
          this.currentAddress,
          this.networkInfo.network,
          this.provider.web3
        );
      } catch (err) {
        console.log(`can't load max burn: ${JSON.stringify(err)}`);
      } finally {
        this.loading = false;
      }
    }
  },
  methods: {
    expandInfo(): void {
      this.infoExpanded = !this.infoExpanded;
    },
    async handleExecuteClaimAndBurn(): Promise<void> {
      if (this.input.asset === undefined) {
        console.error("[deposit-form] can't execute  due to empty input asset");
        return;
      }
      if (!notZero(this.input.amount)) {
        console.error(
          "[deposit-form] can't execute claim and burn due to zero amount"
        );
        return;
      }

      this.loaderStep = 'Confirm';
      try {
        await claimAndBurnCompound(
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

        if (this.maxBurnedAmount === undefined) {
          this.transferError = 'Burn conditions error';
          return;
        }

        if (greaterThan(this.input.amount, this.maxBurnedAmount)) {
          this.transferError = 'Burn limit reached';
          return;
        }

        this.claimingFor = await getExitingAmount(
          this.currentAddress,
          this.input.amount,
          this.networkInfo.network,
          this.provider.web3
        );

        await this.tryToEstimate(this.input.amount, this.input.asset);
      } catch (err) {
        console.error(`can't calc data: ${err}`);
        this.transferError = 'Estimatiom Error';
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

        if (this.maxBurnedAmount === undefined) {
          this.transferError = 'Burn conditions error';
          return;
        }

        if (greaterThan(this.input.amount, this.maxBurnedAmount)) {
          this.transferError = 'Burn limit reached';
          return;
        }

        this.claimingFor = await getExitingAmount(
          this.currentAddress,
          this.input.amount,
          this.networkInfo.network,
          this.provider.web3
        );

        await this.tryToEstimate(this.input.amount, this.input.asset);
      } catch (err) {
        console.error(`can't calc data: ${err}`);
        this.transferError = 'Estimate error';
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

      this.actionGasLimit = '0';
      this.claimingFor = '0';
    },
    handleSelectedGasChanged(newGas: GasModeData): void {
      this.selectedGasPrice = String(newGas.price);
    },
    async tryToEstimate(
      inputAmount: string,
      inputAsset: SmallToken
    ): Promise<void> {
      const resp = await estimateClaimAndBurnCompound(
        inputAsset,
        inputAmount,
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
    }
  }
});
</script>
