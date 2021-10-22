<template>
  <secondary-page
    :has-back-button="hasBackButton"
    hide-title
    @back="handleBack"
  >
    <treasury-decrease-form v-if="!isShowReview" @tx-review="handleTxReview" />
    <treasury-decrease-review
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

import { withdrawCompound } from '@/wallet/actions/treasury/withdraw/withdraw';
import { TokenWithBalance } from '@/wallet/types';

import { Step } from '@/components/controls/full-page-form-loader';
import { FullPageFormLoader } from '@/components/controls/full-page-form-loader';
import { SecondaryPage } from '@/components/layout/secondary-page';
import {
  TreasuryDecreaseForm,
  TreasuryDecreaseReview
} from '@/components/treasury';

export default Vue.extend({
  name: 'TreasuryDecreaseWrapper',
  components: {
    TreasuryDecreaseReview,
    TreasuryDecreaseForm,
    FullPageFormLoader,
    SecondaryPage
  },
  data() {
    return {
      isShowReview: false,
      txStep: undefined as Step | undefined,

      token: undefined as TokenWithBalance | undefined,
      amount: undefined as string | undefined,
      nativeAmount: undefined as string | undefined,
      isSubsidizedEnabled: false,
      estimatedGasCost: undefined as string | undefined,
      actionGasLimit: undefined as string | undefined,
      approveGasLimit: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('account', ['networkInfo', 'currentAddress', 'provider']),
    hasBackButton(): boolean {
      return this.txStep === undefined;
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
      isSubsidizedEnabled: boolean;
      estimatedGasCost: string;
      actionGasLimit: string;
      approveGasLimit: string;
    }): void {
      this.token = args.token;
      this.amount = args.amount;
      this.nativeAmount = args.nativeAmount;
      this.isSubsidizedEnabled = args.isSubsidizedEnabled;
      this.estimatedGasCost = args.estimatedGasCost;
      this.actionGasLimit = args.actionGasLimit;
      this.approveGasLimit = args.approveGasLimit;

      this.isShowReview = true;
    },
    async handleTxStart(args: { isSmartTreasury: boolean }): Promise<void> {
      if (this.token === undefined) {
        console.error('token is empty during `handleTxStart`');
        Sentry.captureException("can't start treasury deposit TX");
        return;
      }

      if (this.amount === undefined) {
        console.error('amount is empty during `handleTxStart`');
        Sentry.captureException("can't start treasury deposit TX");
        return;
      }

      if (this.actionGasLimit === undefined) {
        console.error('action gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start treasury deposit TX");
        return;
      }

      if (this.approveGasLimit === undefined) {
        console.error('approve gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start treasury deposit TX");
        return;
      }

      console.log('is smart treasury:', args.isSmartTreasury);

      this.txStep = 'Confirm';
      try {
        await withdrawCompound(
          this.token,
          this.amount,
          this.networkInfo.network,
          this.provider.web3,
          this.currentAddress,
          this.actionGasLimit,
          async () => {
            this.txStep = 'Process';
          }
        );
        this.txStep = 'Success';
      } catch (err) {
        this.txStep = 'Reverted';
        console.log('Treasury deposit txn reverted');
        Sentry.captureException(err);
      }
    }
  }
});
</script>
