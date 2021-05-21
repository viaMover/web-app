<template>
  <secondary-page has-heading-buttons :title="$t('treasury.lblSmartTreasury')">
    <template v-slot:heading-buttons>
      <heading-nav-button
        button-class="transparent"
        navigate-to-name="treasury-deposit"
      >
        {{ $t('treasury.btnDeposit.emoji') }}
      </heading-nav-button>
      <heading-nav-button
        button-class="transparent"
        navigate-to-name="treasury-decrease-boost"
      >
        {{ $t('treasury.btnWithdraw.emoji') }}
      </heading-nav-button>
      <heading-nav-button
        button-class="transparent"
        navigate-to-name="treasury-claim-and-burn"
      >
        {{ $t('treasury.btnClaimAndBurn.emoji') }}
      </heading-nav-button>
    </template>

    <h2>{{ $t('treasury.lblManageTreasury') }}</h2>
    <treasury-yearly-chart />
    <treasury-statements />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { SecondaryPage } from '@/components/layout';
import { HeadingNavButton } from '@/components/buttons';
import { TreasuryYearlyChart, TreasuryStatements } from '@/components/treasury';

export default Vue.extend({
  name: 'TreasuryManage',
  components: {
    SecondaryPage,
    HeadingNavButton,
    TreasuryYearlyChart,
    TreasuryStatements
  }
});
</script>
