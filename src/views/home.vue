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
      <home-cards-order-of-liberty v-if="isOrderOfLibertyNFTEnabled" />
      <home-cards-debit-card v-else-if="isDebitCardEnabled" />
      <home-cards-savings-deposit v-else-if="isSavingsEnabled" />
    </div>

    <home-navigation-section />

    <template v-slot:modals>
      <template v-if="isSwapModalEnabled">
        <swap-modal key="swap-modal" />
        <search-modal key="search-modal" />
      </template>
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { isFeatureEnabled } from '@/settings';

import {
  HomeCardsDebitCard,
  HomeCardsOrderOfLiberty,
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
    HomeCardsOrderOfLiberty,
    SwapModal,
    SearchModal
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo'
    }),
    isDebitCardEnabled(): boolean {
      return isFeatureEnabled('isDebitCardEnabled', this.networkInfo?.network);
    },
    isSwapModalEnabled(): boolean {
      return (
        isFeatureEnabled('isSwapEnabled', this.networkInfo?.network) &&
        isFeatureEnabled('isHomeSwapModalEnabled', this.networkInfo?.network)
      );
    },
    isOrderOfLibertyNFTEnabled(): boolean {
      return isFeatureEnabled(
        'isOrderOfLibertyNFTEnabled',
        this.networkInfo?.network
      );
    },
    isSavingsEnabled(): boolean {
      return isFeatureEnabled('isSavingsEnabled', this.networkInfo?.network);
    }
  },
  methods: {
    isFeatureEnabled
  }
});
</script>
