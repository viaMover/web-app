<template>
  <div class="savings__menu-wrapper-statements">
    <h2>{{ $t('savings.lblSavingsStatements') }}</h2>
    <savings-statement-item
      v-for="item in statements"
      :key="item.snapshotTimestamp"
      :item="item"
    />
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
