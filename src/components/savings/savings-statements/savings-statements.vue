<template>
  <div class="savings-statement__wrapper">
    <h2>{{ $t('savings.lblSavingsStatements') }}</h2>
    <div class="info info-bordered">
      <savings-statement-item
        v-for="item in statements"
        :key="item.snapshotTimestamp"
        :item="item"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import SavingsStatementItem from './savings-statement-item.vue';

export default Vue.extend({
  name: 'SavingsStatements',
  components: {
    SavingsStatementItem
  },
  computed: {
    ...mapGetters('account', { statements: 'savingsMonthStatsOptions' })
  }
});
</script>
