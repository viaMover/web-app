<template>
  <content-wrapper
    has-back-button
    has-left-rail
    left-rail-inner-wrapper-class="page-sidebar-wrapper"
    wrapper-class="savings"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <savings-overview />
      <savings-stats />
      <savings-estimation />
    </template>

    <router-view />

    <savings-deposit-modal />
    <savings-withdraw-modal />
    <search-modal />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper } from '@/components/layout';
import {
  SavingsOverview,
  SavingsStats,
  SavingsEstimation
} from '@/components/savings';
import {
  SearchModal,
  SavingsDepositModal,
  SavingsWithdrawModal
} from '@/components/modals';

import '@/styles/_savings.less';
import { mapGetters } from 'vuex';

export default Vue.extend({
  name: 'SavingsRoot',
  components: {
    ContentWrapper,
    SavingsOverview,
    SavingsStats,
    SavingsEstimation,
    SavingsDepositModal,
    SavingsWithdrawModal,
    SearchModal
  },
  computed: {
    ...mapGetters('account', {
      hasActiveSavings: 'hasActiveSavings',
      savingsMonthStatsOptions: 'savingsMonthStatsOptions'
    }),
    isReplaceRouteNeeded(): boolean {
      return this.$route.name !== 'savings-empty' && !this.hasActiveSavings;
    }
  },
  watch: {
    isReplaceRouteNeeded(newVal: boolean) {
      if (newVal) {
        this.replaceInactiveSavingsRoute();
      }
    }
  },
  beforeMount() {
    if (this.isReplaceRouteNeeded) {
      this.replaceInactiveSavingsRoute();
    }
  },
  methods: {
    handleClose(): void {
      this.$router.replace({
        name: 'home'
      });
    },
    replaceInactiveSavingsRoute(): void {
      this.$router.replace({
        name: 'savings-empty'
      });
    }
  }
});
</script>
