<template>
  <div class="item">
    <div class="description">
      <span>{{ headerText }}</span>
      <span v-if="!isInProgress">{{ itemText }}</span>
      <span v-else>{{ $t('savings.lblInProgress') }}</span>
    </div>
    <div v-if="!isInProgress" class="link">
      <router-link
        class="black-link"
        :to="{
          name: 'savings-month-stats',
          params: { year: item.year, month: item.month }
        }"
      >
        {{ $t('savings.btnView.simple') }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import dayjs from 'dayjs';

import { MonthBalanceItem } from '@/services/mover/savings';

export default Vue.extend({
  name: 'SavingsStatementItem',
  props: {
    item: {
      type: Object as PropType<MonthBalanceItem>,
      required: true
    }
  },
  computed: {
    isInProgress(): boolean {
      const currentDate = dayjs();

      return (
        currentDate.get('year') === this.item.year &&
        currentDate.get('month') === this.item.month
      );
    },
    headerText(): string {
      return dayjs(new Date(this.item.year, this.item.month, 0)).format(
        'MMMM YYYY'
      );
    },
    itemText(): string {
      const dateFrom = dayjs(new Date(this.item.year, this.item.month, 0));
      const dateTo = dateFrom.add(1, 'month');

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
