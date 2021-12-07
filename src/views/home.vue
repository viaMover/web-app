<template>
  <content-wrapper class="home" has-left-rail>
    <template v-slot:left-rail>
      <aside class="left-rail transactions">
        <transaction-list />
      </aside>
    </template>

    <header-balance />
    <debit-card-section v-if="isFeatureEnabled('isDebitCardEnabled')" />
    <savings-deposit-card-section />
    <menu-section />

    <template v-slot:modals>
      <swap-modal key="swap-modal" />
      <savings-deposit-modal key="savings-deposit-modal" />
      <savings-withdraw-modal key="savings-withdraw-modal" />
      <treasury-increase-boost-modal key="treasury-increase-boost-modal" />
      <search-modal key="search-modal" />
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { isFeatureEnabled } from '@/settings';

import { ContentWrapper } from '@/components/layout';
import {
  SavingsDepositModal,
  SavingsWithdrawModal,
  SearchModal,
  SwapModal,
  TreasuryIncreaseBoostModal
} from '@/components/modals';
import {
  DebitCardSection,
  HeaderBalance,
  MenuSection,
  SavingsDepositCardSection
} from '@/components/sections';
import { TransactionList } from '@/components/transaction-list';

import '@/styles/_general.less';

export default Vue.extend({
  name: 'Home',
  components: {
    SavingsDepositCardSection,
    DebitCardSection,
    MenuSection,
    ContentWrapper,
    TransactionList,
    HeaderBalance,
    SwapModal,
    SearchModal,
    SavingsDepositModal,
    SavingsWithdrawModal,
    TreasuryIncreaseBoostModal
  },
  inject: {
    themeColors: {
      default: {}
    }
  },
  methods: {
    isFeatureEnabled
  }
});
</script>
