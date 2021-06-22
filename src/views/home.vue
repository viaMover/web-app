<template>
  <content-wrapper has-left-rail wrapper-class="general-desktop">
    <template v-slot:left-rail>
      <wallet-info-rail />
    </template>

    <header-balance />
    <div class="general-desktop__menu-wrapper-item">
      <div class="general-desktop__menu-wrapper-item-links">
        <release-radar-section />
        <swaps-section />
      </div>
    </div>
    <debit-card-section />
    <savings-section />
    <treasury-section />
    <governance-section />
    <nibble-shop-section />
    <nfts-section />

    <transaction-modal />
    <swap-modal />
    <search-modal />
  </content-wrapper>
</template>

<script lang="ts">
import '@/styles/_general.less';

import Vue from 'vue';

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
  NftsSection,
  HeaderBalance
} from '@/components/sections';
import { TransactionModal, SwapModal, SearchModal } from '@/components/modals';

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
    NftsSection,
    HeaderBalance,
    TransactionModal,
    SwapModal,
    SearchModal
  }
});
</script>
