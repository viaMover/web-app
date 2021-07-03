<template>
  <div class="overview savings-overview">
    <h4>{{ $t('savings.lblSavingsEstimation') }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{
          $t('savings.lblEstimatedEarningsTomorrow')
        }}</span>
        <span class="value">{{ estimatedEarningsTomorrowNative }}</span>
      </div>
      <div class="item">
        <span class="title">{{
          $t('savings.lblEstimatedEarningsNextMonth')
        }}</span>
        <span class="value">{{ estimatedEarningsNextMonthNative }}</span>
      </div>
      <div class="item">
        <span class="title">{{
          $t('savings.lblEstimatedEarningsAnnually')
        }}</span>
        <span class="value">{{ estimatedEarningsAnnuallyNative }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import BigNumber from 'bignumber.js';

export default Vue.extend({
  name: 'SavingsEstimation',
  computed: {
    ...mapState('account', [
      'isSavingsInfoLoading',
      'savingsAPY',
      'savingsDPY'
    ]),
    ...mapGetters('account', ['savingsInfoBalanceNative']),
    estimatedEarningsTomorrowNative(): string {
      if (this.isSavingsInfoLoading) {
        return 'loading...';
      }

      if (this.savingsDPY === undefined) {
        return '0';
      }

      return new BigNumber(this.savingsInfoBalanceNative)
        .multipliedBy(new BigNumber(this.savingsDPY).dividedBy(100))
        .toFixed(2);
    },
    estimatedEarningsNextMonthNative(): string {
      if (this.isSavingsInfoLoading) {
        return 'loading...';
      }

      if (this.savingsDPY === undefined) {
        return '0';
      }

      return new BigNumber(this.savingsInfoBalanceNative)
        .multipliedBy(
          new BigNumber(this.savingsDPY).dividedBy(100).multipliedBy(30)
        )
        .toFixed(2);
    },
    estimatedEarningsAnnuallyNative(): string {
      if (this.isSavingsInfoLoading) {
        return 'loading...';
      }

      if (this.savingsDPY === undefined) {
        return '0';
      }

      return new BigNumber(this.savingsInfoBalanceNative)
        .multipliedBy(new BigNumber(this.savingsAPY).dividedBy(100))
        .toFixed(2);
    }
  }
});
</script>
