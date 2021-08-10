<template>
  <content-wrapper has-left-rail wrapper-class="general-desktop">
    <template v-slot:left-rail>
      <transaction-list />
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
import { TransactionList } from '@/components/transaction-list';
import {
  DebitCardSection,
  HeaderBalance,
  MenuSection,
  SavingsDepositCardSection
} from '@/components/sections';
import {
  SearchModal,
  SwapModal,
  SavingsDepositModal,
  SavingsWithdrawModal,
  TreasuryIncreaseBoostModal
} from '@/components/modals';

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
  methods: {
    isFeatureEnabled
  }
});
</script>
