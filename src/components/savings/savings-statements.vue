<template>
  <div class="info info-bordered">
    <div v-for="item in statements" :key="item.timeStampFrom" class="item">
      <div class="description">
        <span>{{ formatItemHeader(item.timeStampFrom) }}</span>
        <span v-if="item.timeStampTo > 0">{{
          formatItemRanges(item.timeStampFrom, item.timeStampTo)
        }}</span>
        <span v-else>{{ $t('savingsPage.lblInProgress') }}</span>
      </div>
      <div v-if="item.timeStampTo > 0" class="link">
        <router-link
          class="button"
          :to="{
            name: 'savings-month-stats',
            query: { tsFrom: item.timeStampFrom }
          }"
        >
          {{ $t('btnView.simple') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import dayjs from 'dayjs';

export default Vue.extend({
  name: 'SavingsStatements',
  data() {
    return {
      statements: [
        { timeStampFrom: 1619805600, timeStampTo: 0 },
        { timeStampFrom: 1617213600, timeStampTo: 1619805600 },
        { timeStampFrom: 1614535200, timeStampTo: 1617213600 },
        { timeStampFrom: 1612116000, timeStampTo: 1614535200 }
      ]
    };
  },
  methods: {
    formatItemHeader(timestamp: number): string {
      return dayjs.unix(timestamp).format('MMMM YYYY');
    },
    formatItemRanges(timestampFrom: number, timestampTo: number): string {
      const dateFrom = dayjs.unix(timestampFrom);
      const dateTo = dayjs.unix(timestampTo);

      if (dateFrom.year() !== dateTo.year()) {
        return `${dateFrom.format('MMM DD, YYYY')} – ${dateTo.format(
          'MMM DD, YYYY'
        )}`;
      }

      return `${dateFrom.format('MMM DD')} – ${dateTo.format('MMM DD, YYYY')}`;
    }
  }
});
</script>
