<template>
  <secondary-page :title="$t('debitCard.lblBeautifulCard')">
    <p class="description black">{{ $t('debitCard.txtBeautifulCard') }}</p>

    <div class="content">
      <div class="container history">
        <debit-card-history-group
          v-for="group in actionHistory"
          :key="group.timestamp"
          :date="formatDate(group.timestamp)"
          :items="group.events"
        />
      </div>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import dayjs from 'dayjs';

import { SecondaryPage } from '@/components/layout';

import DebitCardHistoryGroup from '../debit-card-history/debit-card-history-group.vue';

export default Vue.extend({
  name: 'DebitCardManagePending',
  components: {
    SecondaryPage,
    DebitCardHistoryGroup
  },
  computed: {
    ...mapGetters('debitCard', {
      actionHistory: 'actionHistoryGroupedByDay'
    })
  },
  methods: {
    formatDate(timestamp: number): string {
      const date = dayjs.unix(timestamp);

      if (dayjs().diff(date, 'days') <= 1) {
        return date.calendar(undefined, {
          sameDay: this.$t('dates.sameDay'),
          lastDay: this.$t('dates.lastDay')
        });
      }
      return date.format('MMMM DD');
    }
  }
});
</script>
