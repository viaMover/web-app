<template>
  <content-wrapper has-left-rail wrapper-class="general-desktop">
    <template v-slot:left-rail>
      <wallet-info-rail />
    </template>

    <header-balance />
    <debit-card-section v-if="isFeatureEnabled('isDebitCardEnabled')" />

    <menu-section />
    <transaction-modal />
    <centered-modal-window v-cloak :modal-id="SwapModalId">
      <swap-form />
    </centered-modal-window>
    <search-modal />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { isFeatureEnabled } from '@/settings';

import { ContentWrapper } from '@/components/layout';
import { WalletInfoRail } from '@/components/wallet-info-rail';
import {
  ReleaseRadarSection,
  SwapsSection,
  DebitCardSection,
  SavingsSection,
  TreasurySection,
  GovernanceSection,
  NibbleShopSection,
  NftDropsSection,
  HeaderBalance,
  MenuSection
} from '@/components/sections';
import { SwapForm } from '@/components/forms';
import {
  TransactionModal,
  SearchModal,
  CenteredModalWindow,
  Modal
} from '@/components/modals';

import '@/styles/_general.less';

export default Vue.extend({
  name: 'Home',
  components: {
    MenuSection,
    ContentWrapper,
    WalletInfoRail,
    DebitCardSection,
    HeaderBalance,
    TransactionModal,
    SwapForm,
    SearchModal,
    CenteredModalWindow
  },
  data() {
    return {
      SwapModalId: Modal.Swap
    };
  },
  methods: {
    isFeatureEnabled
  }
});
</script>
