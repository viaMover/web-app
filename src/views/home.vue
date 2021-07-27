<template>
  <content-wrapper has-left-rail wrapper-class="general-desktop">
    <template v-slot:left-rail>
      <wallet-info-rail />
    </template>

    <header-balance />
    <debit-card-section v-if="isFeatureEnabled('isDebitCardEnabled')" />

    <template v-if="isFeatureEnabled('isReleaseRadarEnabled')">
      <div class="general-desktop__menu-wrapper-item">
        <div class="general-desktop__menu-wrapper-item-links">
          <release-radar-section />
          <swaps-section />
        </div>
      </div>
    </template>
    <template v-else>
      <swaps-section
        inner-container-class="general-desktop__menu-wrapper-item-info"
        own-class="general-desktop__menu-wrapper-item"
      />
    </template>

    <savings-section />
    <treasury-section />
    <governance-section v-if="isFeatureEnabled('isGovernanceEnabled')" />
    <nibble-shop-section v-if="isFeatureEnabled('isNibbleShopEnabled')" />
    <nft-drops-section v-if="isFeatureEnabled('isNftDropsEnabled')" />

    <transaction-modal />
    <centered-modal-window
      v-cloak
      disable-close-on-backdrop
      :modal-id="SwapModalId"
    >
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
  HeaderBalance
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
    ContentWrapper,
    WalletInfoRail,
    ReleaseRadarSection,
    SwapsSection,
    DebitCardSection,
    SavingsSection,
    TreasurySection,
    GovernanceSection,
    NibbleShopSection,
    NftDropsSection,
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
