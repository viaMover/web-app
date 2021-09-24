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
      :token="token"
      @tx-start="handleTxStart"
    />
    <savings-form-loader v-else :step="txStep" />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { TokenWithBalance } from '@/wallet/types';

import { SecondaryPage } from '@/components/layout/secondary-page';
import {
  SavingsWithdrawForm,
  SavingsWithdrawReview,
  SavingsFormLoader
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

      isSmartTreasury: true as boolean,
      token: undefined as TokenWithBalance | undefined,
      amount: undefined as string | undefined
    };
  },
  computed: {
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
    handleTxReview(args: { token: TokenWithBalance; amount: string }): void {
      this.token = args.token;
      this.amount = args.amount;

      this.isShowReview = true;
    },
    handleTxStart(args: { isSmartTreasury: boolean }): void {
      this.isSmartTreasury = args.isSmartTreasury;

      this.txStep = 'Process';
    }
  }
});
</script>
