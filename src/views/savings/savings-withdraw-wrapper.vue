<template>
  <secondary-page
    :has-back-button="hasBackButton"
    hide-title
    @back="handleBack"
  >
    <savings-withdraw-form v-if="!isShowReview" @tx-review="handleTxReview" />
    <savings-withdraw-review
      v-else-if="txStep === undefined"
      :amount="amount"
      :estimated-gas-cost="estimatedGasCost"
      :subsidized-enabled="subsidizedEnabled"
      :token="token"
      @tx-start="handleTxStart"
    />
    <savings-form-loader v-else :step="txStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import * as Sentry from '@sentry/vue';

import { withdrawCompound } from '@/wallet/actions/savings/withdraw/withdraw';
import { TokenWithBalance } from '@/wallet/types';

import { SecondaryPage } from '@/components/layout/secondary-page';
import {
  SavingsFormLoader,
  SavingsWithdrawForm,
  SavingsWithdrawReview
} from '@/components/savings';

export default Vue.extend({
  name: 'SavingsWithdrawWrapper',
  components: {
    SavingsFormLoader,
    SavingsWithdrawReview,
    SavingsWithdrawForm,
    SecondaryPage
  },
  data() {
    return {
      isShowReview: false as boolean,
      txStep: undefined as string | undefined,

      token: undefined as TokenWithBalance | undefined,
      amount: undefined as string | undefined,
      subsidizedEnabled: false as boolean,
      estimatedGasCost: undefined as string | undefined,
      actionGasLimit: undefined as string | undefined
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
      subsidizedEnabled: boolean;
      estimatedGasCost: string;
      actionGasLimit: string;
    }): void {
      console.log('TX REVIEW ');
      this.token = args.token;
      this.amount = args.amount;
      this.subsidizedEnabled = args.subsidizedEnabled;
      this.estimatedGasCost = args.estimatedGasCost;
      this.actionGasLimit = args.actionGasLimit;

      this.isShowReview = true;
    },
    async handleTxStart(args: { isSmartTreasury: boolean }): Promise<void> {
      if (this.token === undefined) {
        console.error('token is empty during `handleTxStart`');
        Sentry.captureException("can't start savings withdraw TX");
        return;
      }

      if (this.amount === undefined) {
        console.error('amount is empty during `handleTxStart`');
        Sentry.captureException("can't start savings withdraw TX");
        return;
      }

      if (this.actionGasLimit === undefined) {
        console.error('action gas limit is empty during `handleTxStart`');
        Sentry.captureException("can't start savings withdraw TX");
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
          args.isSmartTreasury,
          async () => {
            this.txStep = 'Process';
          }
        );
        this.txStep = 'Success';
      } catch (err) {
        this.txStep = 'Reverted';
        console.log('Savings withdraw swap reverted');
        Sentry.captureException(err);
      }
    }
  }
});
</script>
