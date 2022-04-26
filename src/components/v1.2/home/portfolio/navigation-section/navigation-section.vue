<template>
  <div class="navigation-wrapper">
    <nav class="sections">
      <section class="group">
        <ul class="items">
          <card v-if="isDebitCardEnabled" />
          <savings v-if="isSavingsEnabled" />
          <smart-treasury v-if="isTreasuryEnabled" />
          <savings-plus v-if="isSavingsPlusEnabled" />
          <staking-ubt v-if="isStakingUBTEnabled" />
        </ul>
      </section>
    </nav>

    <nav class="actions">
      <section class="group">
        <ul class="items">
          <base-item-icon
            v-if="isSwapEnabled"
            icon-class="icon-swap-tokens"
            navigate-to="swap"
            :text="$t('swapTokens')"
          />

          <base-item-icon
            v-if="isSavingsEnabled"
            icon-class="icon-about-savings"
            navigate-to="savings"
            :text="$t('manageSavings')"
          />

          <base-item-icon
            v-if="isSavingsPlusEnabled"
            icon-class="icon-about-savings-plus"
            navigate-to="savings-plus-deposit"
            :text="$t('manageSavingsPlus')"
          />

          <base-item-icon
            v-if="isTreasuryEnabled"
            icon-class="icon-about-smart-treasury"
            navigate-to="treasury"
            :text="$t('manageSmartTreasury')"
          />

          <base-item-icon
            v-if="isDebitCardTopUpEnabled"
            icon-class="icon-card-top-up"
            :navigate-to="debitCardTopUpLocation"
            :text="$t('cardTopUp')"
          />

          <base-item-icon
            v-if="isStakingUBTEnabled"
            icon-class="icon-about-staking"
            navigate-to="staking-ubt-deposit"
            :text="$t('manageStaking')"
          />
        </ul>
      </section>
    </nav>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Location } from 'vue-router';
import { mapState } from 'vuex';

import { isFeatureEnabled } from '@/settings';

import BaseItemIcon from './base-item-icon.vue';
import Card from './card.vue';
import Savings from './savings.vue';
import SavingsPlus from './savings-plus.vue';
import SmartTreasury from './smart-treasury.vue';
import StakingUbt from './staking-ubt.vue';

export default Vue.extend({
  name: 'PortfolioNavigationSection',
  components: {
    Card,
    Savings,
    SmartTreasury,
    SavingsPlus,
    StakingUbt,
    BaseItemIcon
  },
  computed: {
    ...mapState('account', { networkInfo: 'networkInfo' }),
    ...mapState('debitCard', { debitCardState: 'cardState' }),
    isEarningsEnabled(): boolean {
      return isFeatureEnabled('isEarningsEnabled', this.networkInfo?.network);
    },
    isSavingsEnabled(): boolean {
      return isFeatureEnabled('isSavingsEnabled', this.networkInfo?.network);
    },
    isTreasuryEnabled(): boolean {
      return isFeatureEnabled('isTreasuryEnabled', this.networkInfo?.network);
    },
    isSwapEnabled(): boolean {
      return isFeatureEnabled('isSwapEnabled', this.networkInfo?.network);
    },
    isHomeSwapModalEnabled(): boolean {
      return isFeatureEnabled(
        'isHomeSwapModalEnabled',
        this.networkInfo?.network
      );
    },
    isSavingsPlusEnabled(): boolean {
      return isFeatureEnabled(
        'isSavingsPlusEnabled',
        this.networkInfo?.network
      );
    },
    isStakingUBTEnabled(): boolean {
      return isFeatureEnabled('isStakingUbtEnabled', this.networkInfo?.network);
    },
    isDebitCardEnabled(): boolean {
      return isFeatureEnabled('isDebitCardEnabled', this.networkInfo?.network);
    },
    isDebitCardTopUpEnabled(): boolean {
      return isFeatureEnabled(
        'isDebitCardTopUpEnabled',
        this.networkInfo?.network
      );
    },
    debitCardTopUpLocation(): Location {
      if (!this.isDebitCardTopUpEnabled) {
        return { name: 'not-found-route' };
      }

      if (this.debitCardState !== 'active') {
        return { name: 'debit-card-manage' };
      }

      return {
        name: 'debit-card-top-up',
        params: {
          step: 'prepare'
        }
      };
    }
  }
});
</script>
