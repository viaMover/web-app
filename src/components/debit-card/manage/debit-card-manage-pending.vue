<template>
  <secondary-page :title="$t('debitCard.lblBeautifulCard')">
    <p class="description">{{ $t('debitCard.txtBeautifulCard') }}</p>

    <div class="content">
      <div class="container history">
        <template v-if="isLoading">
          <debit-card-history-group-skeleton :items-count="2" />
          <debit-card-history-group-skeleton :items-count="1" />
        </template>
        <template v-else>
          <debit-card-history-group
            v-for="group in actionHistory"
            :key="group.timestamp"
            :date="formatDate(group.date)"
            :items="group.items"
          />
        </template>
      </div>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

export default Vue.extend({
  name: 'DebitCardManagePending',
  computed: {
    ...mapState('debitCard', {
      isLoading: 'isActionHistoryLoading'
    }),
    ...mapGetters('debitCard', {
      actionHistory: 'actionHistoryGroupedByDay'
    })
  },
  async mounted() {
    await this.loadActionHistory();
  },
  methods: {
    ...mapActions('debitCard', {
      loadActionHistory: 'loadActionHistory'
    }),
    formatDate(timestamp: number): string {
      return dayjs.unix(timestamp).format('MMMM DD');
    }
  }
});
</script>
