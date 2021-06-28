<template>
  <div class="overview savings-overview">
    <h4>{{ $t('savings.lblSavingsStats') }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{ $t('savings.lblEarnedToday') }}</span>
        <span class="value">{{ earnedToday }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('savings.lblEarnedThisMonth') }}</span>
        <span class="value">{{ earnedThisMonth }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('savings.lblEarnedInTotal') }}</span>
        <span class="value">{{ earnedTotal }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

export default Vue.extend({
  name: 'SavingsStats',
  data() {
    return {
      earnedToday: 0
    };
  },
  computed: {
    ...mapGetters('account', {
      earnedThisMonth: 'savingsInfoEarnedThisMonthNative',
      earnedTotal: 'savingsInfoEarnedTotalNative'
    })
  }
});
</script>
