<template>
  <content-wrapper has-left-rail wrapperClass="general-desktop">
    <template v-slot:left-rail>
      <wallet-info-rail />
    </template>

    <header-balance class="general-desktop__menu-wrapper-balance" />
    <div class="general-desktop__menu-wrapper-item">
      <div class="general-desktop__menu-wrapper-item-links">
        <release-radar-section class="links__item" />
        <swaps-section class="links__item" />
      </div>
    </div>
    <debit-card-section class="general-desktop__menu-wrapper-item" />
    <savings-section class="general-desktop__menu-wrapper-item" />
    <treasury-section class="general-desktop__menu-wrapper-item" />
    <governance-section class="general-desktop__menu-wrapper-item" />
    <nibble-shop-section class="general-desktop__menu-wrapper-item" />
    <nfts-section class="general-desktop__menu-wrapper-item" />

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
