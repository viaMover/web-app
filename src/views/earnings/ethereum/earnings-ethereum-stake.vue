<template>
  <secondary-page
    class="stake"
    :has-back-button="showBackButton"
    @back="handleBack"
  >
    <prepare-form
      v-if="currentStep === 'prepare'"
      :asset="inputAsset"
      has-select-modal
      :header-description="$t('earnings.ethereum.txtStakeDescription')"
      :header-title="$t('earnings.ethereum.lblStake')"
      :input-amount="inputAmount"
      :input-amount-native="inputAmountNative"
      :input-asset-heading="$t('earnings.lblWhatDoWeDeposit')"
      :input-mode="inputMode"
      :is-loading="isLoading"
      :is-processing="isProcessing"
      :operation-description="$t('earnings.ethereum.txtPotentialEarnings')"
      :operation-title="estimatedAnnualEarnings"
      :output-asset-heading-text="$t('earnings.lblAmountWeDepositIn')"
      :selected-token-description="inputAssetDescription"
      :transfer-error="transferError"
      @open-select-modal="handleOpenSelectModal"
      @review-tx="handleReviewTx"
      @select-max-amount="handleSelectMaxAmount"
      @toggle-input-mode="handleToggleInputMode"
      @update-amount="handleUpdateAmount"
    >
      <template v-slot:swap-message>
        <div
          v-if="isSwapNeeded && formattedEthTotal && inputMode === 'TOKEN'"
          class="form-swap"
        >
          <p>
            {{ $t('forms.lblSwappingFor') }}
            <custom-picture
              :alt="$t('lblTokenAlt', { symbol: 'ETH' })"
              class="token"
              :sources="ethPicture.sources"
              :src="ethPicture.src"
            />
            <span>{{ formattedEthTotal }}</span>
          </p>
        </div>
      </template>
    </prepare-form>
    <review-form
      v-else-if="currentStep === 'review'"
      :amount="inputAmount"
      :button-text="reviewActionButtonText"
      :estimated-gas-cost="estimatedGasCost"
      :header-title="$t('earnings.lblReviewYourStake')"
      :image="stake"
      :input-amount-native-title="$t('earnings.lblAndTotalOf')"
      :input-amount-title="$t('earnings.lblAmountWeDepositIn')"
      :is-subsidized-enabled="isSubsidizedEnabled"
      :native-amount="inputAmountNative"
      :token="inputAsset"
      @tx-start="handleCreateTx"
    />
    <loader-form v-else-if="currentStep === 'loader'" :step="transactionStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { RawLocation } from 'vue-router';
import { mapActions, mapGetters, mapState } from 'vuex';

import * as Sentry from '@sentry/vue';
import BigNumber from 'bignumber.js';

import { TransferData } from '@/services/0x/api';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { sameAddress } from '@/utils/address';
import { divide, multiply } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';
import { getUSDCAssetData } from '@/wallet/references/data';
import { SmallTokenInfoWithIcon, TokenWithBalance } from '@/wallet/types';

import { InputMode } from '@/components/forms';
import { Step as TransactionStep } from '@/components/forms/form-loader';
import PrepareForm from '@/components/forms/prepare-form/prepare-form.vue';
import ReviewForm from '@/components/forms/review-form.vue';
import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';
import LoaderForm from '@/components/v1.2/form-controls/loader-form/loader-form.vue';
import SecondaryPage from '@/components/v1.2/layout/secondary-page.vue';

type processStep = 'prepare' | 'review' | 'loader';

export default Vue.extend({
  name: 'EarningsEthereumStake',
  components: {
    CustomPicture,
    PrepareForm,
    ReviewForm,
    SecondaryPage,
    LoaderForm
  },
  props: {
    currentStep: {
      type: String as PropType<processStep>,
      default: 'prepare'
    }
  },
  data() {
    return {
      stake: {
        alt: this.$t('earnings.ethereum.txtStakePictureAlt'),
        src: require('@/assets/images/earnings-ethereum-and-olympus@1x.png'),
        sources: [
          {
            src: require('@/assets/images/earnings-ethereum-and-olympus@1x.png')
          },
          {
            variant: '2x',
            src: require('@/assets/images/earnings-ethereum-and-olympus@2x.png')
          }
        ]
      } as PictureDescriptor,
      ethPicture: {
        src: require('@/assets/images/ETH.png'),
        sources: [
          {
            src: require('@/assets/images/ETH@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor,
      inputAsset: undefined as TokenWithBalance | undefined,
      inputAmount: '' as string,
      inputAmountNative: '' as string,
      inputMode: 'TOKEN' as InputMode,
      isTokenSelectedByUser: false,
      isLoading: false,
      isProcessing: false,
      transferData: undefined as TransferData | undefined,
      transferError: undefined as undefined | string,
      estimatedGasCost: undefined as string | undefined,
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined,
      isSubsidizedEnabled: true,
      transactionStep: 'Confirm' as TransactionStep
    };
  },
  computed: {
    ...mapState('account', ['networkInfo', 'ethPrice', 'tokens']),
    ...mapGetters('account', {
      usdcNativePrice: 'usdcNativePrice'
    }),
    showBackButton(): boolean {
      return this.currentStep !== 'loader';
    },
    USDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    estimatedAnnualEarnings(): string {
      return `~$${formatToNative(0)}`;
    },
    inputAssetDescription(): string {
      if (this.inputAsset === undefined) {
        return '';
      }

      if (sameAddress(this.inputAsset.address, 'eth')) {
        return this.$t('earnings.ethereum.txtNativeAsset') as string;
      }

      return this.$t('earnings.txtNotNativeAsset', {
        targetSymbol: 'ETH'
      }) as string;
    },
    reviewActionButtonText(): string {
      if (this.inputAsset === undefined) {
        return '';
      }

      return this.$t('earnings.btnStake', {
        symbol: this.inputAsset.symbol
      }) as string;
    },
    formattedEthTotal(): string {
      if (this.inputAsset === undefined) {
        return '0 ETH';
      }

      if (sameAddress(this.inputAsset.address, 'eth')) {
        return `${formatToNative(this.inputAmount)} ETH`;
      }

      const eth = new BigNumber(this.inputAmount)
        .multipliedBy(this.inputAsset.priceUSD)
        .dividedBy(this.usdcNativePrice); // (input * asset.Price) / USDcPrice
      return `${formatToNative(eth)} ETH`;
    },
    isSwapNeeded(): boolean {
      if (this.inputAsset === undefined) {
        return true;
      }

      return !sameAddress(this.inputAsset.address, 'eth');
    }
  },
  watch: {
    tokens: {
      handler(newVal: Array<TokenWithBalance>) {
        if (this.isTokenSelectedByUser) {
          return;
        }

        this.isLoading = true;
        const ethTokenInWallet = newVal.find((token) =>
          sameAddress(token.address, 'eth')
        );
        if (ethTokenInWallet === undefined) {
          this.isLoading = false;
          return;
        }

        this.inputAsset = ethTokenInWallet;
        this.inputAmount = '';
        this.inputAmountNative = '';
        this.isLoading = false;
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
    async handleOpenSelectModal(): Promise<void> {
      this.isLoading = true;

      const newAsset = await this.setModalIsDisplayed({
        id: ModalType.SearchToken,
        value: true,
        payload: {
          useWalletTokens: true
        }
      });

      if (newAsset !== undefined) {
        this.inputAsset = newAsset;
        this.inputAmount = '';
        this.inputAmountNative = '';
        this.isTokenSelectedByUser = true;
      }

      this.isLoading = false;
    },
    handleReviewTx(): void {
      if (this.inputAsset === undefined) {
        return;
      }

      this.isSubsidizedEnabled = false;
      this.estimatedGasCost = undefined;
      this.actionGasLimit = '0';
      this.approveGasLimit = '0';
      this.isProcessing = true;
      try {
        // plain code HERE
      } catch (err) {
        this.isSubsidizedEnabled = false;
        console.error(err);
        Sentry.captureException("can't estimate earnings deposit for subs");
        return;
      } finally {
        this.isProcessing = false;
      }
      this.changeStep('review');
    },
    handleToggleInputMode(): void {
      if (this.inputMode === 'NATIVE') {
        this.inputMode = 'TOKEN';
        return;
      }

      this.inputMode = 'NATIVE';
    },
    handleSelectMaxAmount(): void {
      if (this.inputAsset === undefined) {
        return;
      }

      this.inputAmount = this.inputAsset.balance;
      this.inputAmountNative = multiply(
        this.inputAsset.balance,
        this.inputAsset.priceUSD
      );
    },
    handleUpdateAmount(amount: string): void {
      if (this.inputAsset === undefined) {
        return;
      }

      if (this.inputMode === 'TOKEN') {
        this.inputAmount = amount;
        this.inputAmountNative = multiply(amount, this.inputAsset.priceUSD);
        return;
      }

      this.inputAmountNative = amount;
      this.inputAmount = divide(amount, this.inputAsset.priceUSD);
    },
    handleCreateTx(args: { isSmartTreasury: boolean }): void {
      this.changeStep('loader');
    },
    handleBack(): void {
      if (this.currentStep === 'review') {
        this.$router.back();
        return;
      }

      this.$router.replace({ name: 'earnings-ethereum-manage' });
    },
    changeStep(target: processStep): void {
      const routerArgs: RawLocation = {
        name: 'earnings-ethereum-stake',
        params: { step: target }
      };

      if (this.currentStep === 'review') {
        this.$router.replace(routerArgs);
        return;
      }

      this.$router.push(routerArgs);
    }
  }
});
</script>
