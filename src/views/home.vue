<template>
  <content-wrapper has-left-rail wrapper-class="general-desktop">
    <template v-slot:left-rail>
      <transaction-list />
    </template>

    <header-balance />
    <debit-card-section v-if="isFeatureEnabled('isDebitCardEnabled')" />
    <deposit-card-section />
    <menu-section />

    <transaction-modal />
    <centered-modal-window v-cloak :modal-id="SwapModalId">
      <swap-form />
    </centered-modal-window>
    <centered-modal-window v-cloak :modal-id="SavingsWithdrawModalId">
      <savings-withdraw-form />
    </centered-modal-window>
    <centered-modal-window v-cloak :modal-id="SavingsDepositModalId">
      <savings-deposit-form />
    </centered-modal-window>
    <centered-modal-window v-cloak :modal-id="TreasuryIncreaseBoostModalId">
      <treasury-increase-boost-form />
    </centered-modal-window>
    <search-modal />
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
  DepositCardSection
} from '@/components/sections';
import { SwapForm } from '@/components/forms';
import {
  TransactionModal,
  SearchModal,
  CenteredModalWindow,
  Modal
} from '@/components/modals';
import {
  TreasuryIncreaseBoostForm,
  SavingsDepositForm,
  SavingsWithdrawForm
} from '@/components/forms';

import '@/styles/_general.less';

export default Vue.extend({
  name: 'Home',
  components: {
    TreasuryIncreaseBoostForm,
    SavingsDepositForm,
    SavingsWithdrawForm,
    DepositCardSection,
    DebitCardSection,
    MenuSection,
    ContentWrapper,
    TransactionList,
    HeaderBalance,
    TransactionModal,
    SwapForm,
    SearchModal,
    CenteredModalWindow
  },
  data() {
    return {
      SwapModalId: Modal.Swap,
      SavingsWithdrawModalId: Modal.SavingsWithdraw,
      SavingsDepositModalId: Modal.SavingsDeposit,
      TreasuryIncreaseBoostModalId: Modal.TreasuryIncreaseBoost
    };
  },
  methods: {
    isFeatureEnabled
  }
});
</script>
