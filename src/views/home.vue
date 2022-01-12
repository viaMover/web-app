<template>
  <content-wrapper class="home" has-left-rail>
    <template v-slot:left-rail>
      <aside class="left-rail transactions">
        <transaction-list />
      </aside>
    </template>

    <header-balance />

    <div class="cards">
      <debit-card-section v-if="isFeatureEnabled('isDebitCardEnabled')" />
      <deposit-card-section v-else />
    </div>

    <menu-section />

    <template v-slot:modals>
      <swap-modal key="swap-modal" />
      <search-modal key="search-modal" />
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { isFeatureEnabled } from '@/settings';

import { ContentWrapper } from '@/components/layout';
import { SearchModal, SwapModal } from '@/components/modals';
import {
  DebitCardSection,
  DepositCardSection,
  HeaderBalance,
  MenuSection
} from '@/components/sections';
import { TransactionList } from '@/components/transaction-list';

export default Vue.extend({
  name: 'Home',
  components: {
    DebitCardSection,
    DepositCardSection,
    MenuSection,
    ContentWrapper,
    TransactionList,
    HeaderBalance,
    SwapModal,
    SearchModal
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
