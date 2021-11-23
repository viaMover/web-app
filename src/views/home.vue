<template>
  <content-wrapper has-left-rail wrapper-class="general-desktop">
    <template v-slot:left-rail>
      <transaction-list />
    </template>

    <header-balance />
    <debit-card-section v-if="isFeatureEnabled('isDebitCardEnabled')" />
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
  MenuSection
} from '@/components/sections';
import { TransactionList } from '@/components/transaction-list';

import '@/styles/_general.less';

export default Vue.extend({
  name: 'Home',
  components: {
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
