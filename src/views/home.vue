<template>
  <content-wrapper class="home" has-left-rail>
    <template v-slot:left-rail>
      <home-left-rail />
    </template>

    <home-masthead-multichain
      v-if="isFeatureEnabled('isMultiChainMastheadEnabled')"
    />
    <home-masthead v-else />

    <div class="cards">
      <home-cards-debit-card v-if="isFeatureEnabled('isDebitCardEnabled')" />
      <home-cards-savings-deposit v-else />
    </div>

    <home-navigation-section />

    <template v-slot:modals>
      <template>
        <swap-modal
          v-if="isFeatureEnabled('isHomeSwapModalEnabled')"
          key="swap-modal"
        />
        <search-modal key="search-modal" />
      </template>
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { isFeatureEnabled } from '@/settings';

import {
  HomeCardsDebitCard,
  HomeCardsSavingsDeposit,
  HomeLeftRail,
  HomeMasthead,
  HomeMastheadMultichain,
  HomeNavigationSection
} from '@/components/home';
import { ContentWrapper } from '@/components/layout';
import { SearchModal, SwapModal } from '@/components/modals';

export default Vue.extend({
  name: 'Home',
  components: {
    ContentWrapper,
    HomeLeftRail,
    HomeMasthead,
    HomeMastheadMultichain,
    HomeNavigationSection,
    HomeCardsDebitCard,
    HomeCardsSavingsDeposit,
    SwapModal,
    SearchModal
  },
  methods: {
    isFeatureEnabled
  }
});
</script>
