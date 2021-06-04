<template>
  <content-wrapper has-left-rail>
    <template v-slot:left-rail>
      <wallet-info-rail />
    </template>

    <header-balance />
    <div class="columns">
      <release-radar-section class="column one of two" />
      <swaps-section class="column one of two" />
    </div>
    <debit-card-section />
    <savings-section />
    <treasury-section />
    <governance-section />
    <nibble-shop-section />
    <nfts-section />

    <transaction-modal />
    <swap-modal />
  </content-wrapper>
</template>

<script lang="ts">
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
import { TransactionModal, SwapModal } from '@/components/modals';

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
    SwapModal
  }
});
</script>
