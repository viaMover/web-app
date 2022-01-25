<template>
  <content-wrapper class="home" has-left-rail>
    <template v-slot:left-rail>
      <aside class="left-rail transactions">
        <transaction-list />
      </aside>
    </template>

    <home-masthead />

    <div class="cards">
      <debit-card-section v-if="isFeatureEnabled('isDebitCardEnabled')" />
      <deposit-card-section v-else />
    </div>

    <home-navigation-section />

    <template v-slot:modals>
      <swap-modal key="swap-modal" />
      <search-modal key="search-modal" />
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { isFeatureEnabled } from '@/settings';

import { HomeMasthead, HomeNavigationSection } from '@/components/home';
import { ContentWrapper } from '@/components/layout';
import { SearchModal, SwapModal } from '@/components/modals';
import { DebitCardSection, DepositCardSection } from '@/components/sections';
import { TransactionList } from '@/components/transaction-list';

export default Vue.extend({
  name: 'Home',
  components: {
    ContentWrapper,
    TransactionList,
    HomeMasthead,
    HomeNavigationSection,
    DebitCardSection,
    DepositCardSection,
    SwapModal,
    SearchModal
  },
  methods: {
    isFeatureEnabled
  }
});
</script>
