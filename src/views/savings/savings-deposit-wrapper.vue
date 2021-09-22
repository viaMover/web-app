<template>
  <secondary-page hide-title>
    <savings-deposit-form v-if="!isShowReview" @tx-review="handleTxReview" />
    <savings-deposit-review
      v-else
      :amount-type="selectedDepositIn"
      :input-amount="amountToDeposit"
      :input-native-amount="nativeAmountToDeposit"
      :selected-token="selectedToken"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { SavingsDepositForm, SavingsDepositReview } from '@/components/savings';
import { TokenWithBalance } from '@/wallet/types';
import SecondaryPage from '@/components/layout/secondary-page/secondary-page.vue';

export default Vue.extend({
  name: 'SavingsDepositWrapper',
  components: { SecondaryPage, SavingsDepositReview, SavingsDepositForm },
  data() {
    return {
      isShowReview: false as boolean,
      selectedToken: undefined as TokenWithBalance | undefined,
      amountToDeposit: undefined as string | undefined,
      nativeAmountToDeposit: undefined as string | undefined,
      selectedDepositIn: undefined as string | undefined
    };
  },
  methods: {
    handleTxReview(args: {
      selectedToken: TokenWithBalance;
      amountToDeposit: string;
      nativeAmountToDeposit: string;
      selectedDepositIn: string;
    }): void {
      this.selectedToken = args.selectedToken;
      this.amountToDeposit = args.amountToDeposit;
      this.nativeAmountToDeposit = args.nativeAmountToDeposit;
      this.selectedDepositIn = args.selectedDepositIn;

      this.isShowReview = true;
    }
  }
});
</script>
