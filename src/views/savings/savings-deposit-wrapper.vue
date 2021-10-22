<template>
  <secondary-page
    :has-back-button="hasBackButton"
    hide-title
    @back="handleBack"
  >
    <savings-deposit-form v-if="!isShowReview" @tx-review="handleTxReview" />
    <savings-deposit-review
      v-else-if="txStep === undefined"
      :amount="amount"
      :estimated-gas-cost="estimatedGasCost"
      :is-subsidized-enabled="isSubsidizedEnabled"
      :native-amount="nativeAmount"
      :token="token"
      @tx-start="handleTxStart"
    />
    <full-page-form-loader v-else :step="txStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import * as Sentry from '@sentry/vue';

import { TransferData } from '@/services/0x/api';
import { sameAddress } from '@/utils/address';
import { depositCompound } from '@/wallet/actions/savings/deposit/deposit';
import { getUSDCAssetData } from '@/wallet/references/data';
import { SmallTokenInfoWithIcon, TokenWithBalance } from '@/wallet/types';

import { Step } from '@/components/controls/form-loader/types';
import { FullPageFormLoader } from '@/components/controls/full-page-form-loader';
import { SecondaryPage } from '@/components/layout/secondary-page';
import { SavingsDepositForm, SavingsDepositReview } from '@/components/savings';

export default Vue.extend({
  name: 'SavingsDepositWrapper',
  components: {
    FullPageFormLoader,
    SecondaryPage,
    SavingsDepositReview,
    SavingsDepositForm
  },
  data() {
    return {
      isShowReview: false as boolean,
      txStep: undefined as Step | undefined,

      token: undefined as TokenWithBalance | undefined,
      amount: undefined as string | undefined,
      nativeAmount: undefined as string | undefined,
      subsidizedEnabled: false as boolean,
      estimatedGasCost: undefined as string | undefined,
      transferData: undefined as TransferData | undefined,
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', ['networkInfo', 'currentAddress', 'provider']),
    hasBackButton(): boolean {
      return this.txStep === undefined;
    },
    outputUSDCAsset(): SmallTokenInfoWithIcon {
      return getUSDCAssetData(this.networkInfo.network);
    },
    isNeedTransfer(): boolean {
      if (this.token === undefined) {
        return true;
      }

      return !sameAddress(this.token.address, this.outputUSDCAsset.address);
    }
  },
  methods: {
    handleBack(): void {
      if (this.isShowReview) {
        this.isShowReview = !this.isShowReview;
      } else {
        this.$router.back();
      }
    },
    handleTxReview(args: {
      token: TokenWithBalance;
      amount: string;
      nativeAmount: string;
      subsidizedEnabled: boolean;
      estimatedGasCost: string;
      actionGasLimit: string;
      approveGasLimit: string;
      transferData?: TransferData;
    }): void {
      this.token = args.token;
      this.amount = args.amount;
      this.nativeAmount = args.nativeAmount;
      this.transferData = args.transferData;
      this.subsidizedEnabled = args.subsidizedEnabled;
      this.estimatedGasCost = args.estimatedGasCost;
      this.actionGasLimit = args.actionGasLimit;
      this.approveGasLimit = args.approveGasLimit;

      this.isShowReview = true;
    },
    async handleTxStart(args: { isSmartTreasury: boolean }): Promise<void> {
      if (this.token === undefined) {
        console.error('token is empty during `handleTxStart`');
        Sentry.captureException("can't start savings deposit TX");
        return;
      }

      if (this.amount === undefined) {
        console.error('amount is empty during `handleTxStart`');
        Sentry.captureException("can't start savings deposit TX");
        return;
      }

      if (this.actionGasLimit === undefined) {
        console.error('action gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start savings deposit TX");
        return;
      }

      if (this.approveGasLimit === undefined) {
        console.error('approve gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start savings deposit TX");
        return;
      }

      if (this.isNeedTransfer && this.transferData === undefined) {
        console.error(
          'transfer data is empty during `handleTxStart` when it is needed'
        );
        Sentry.captureException("can't start savings deposit TX");
        return;
      }

      console.log('is smart treasury:', args.isSmartTreasury);

      this.txStep = 'Confirm';
      try {
        await depositCompound(
          this.token,
          this.outputUSDCAsset,
          this.amount,
          this.transferData,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          args.isSmartTreasury,
          async () => {
            this.txStep = 'Process';
          },
          this.actionGasLimit,
          this.approveGasLimit
        );
        this.txStep = 'Success';
      } catch (err) {
        this.txStep = 'Reverted';
        console.log('Savings deposit swap reverted');
        Sentry.captureException(err);
      }
    }
  }
});
</script>
