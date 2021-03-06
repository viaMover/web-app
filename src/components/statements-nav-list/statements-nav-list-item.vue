<template>
  <div class="item">
    <div class="info">
      <div class="icon">
        <span>{{ icon }}</span>
      </div>
      <progress-loader
        class="progress-loader"
        :is-animated="isInProgress"
        :value="isInProgress ? currentMonthProgress : 100"
      />
      <div class="text">
        <h3 class="title">{{ headerText }}</h3>
        <div v-if="!isInProgress" class="description">{{ itemText }}</div>
        <div v-else class="description">{{ inProgressText }}</div>
      </div>
    </div>
    <div v-if="!isInProgress" class="action">
      <router-link
        class="button"
        :to="{
          name: navigateToName,
          params: { year: item.year, month: item.month }
        }"
      >
        {{ buttonText }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import dayjs from 'dayjs';

import {
  SavingsMonthBalanceItem,
  TreasuryMonthBonusesItem
} from '@/services/mover';
import { dateFromExplicitPair } from '@/utils/time';

import { ProgressLoader } from '@/components/layout';

export default Vue.extend({
  name: 'StatementsNavListItem',
  components: {
    ProgressLoader
  },
  props: {
    item: {
      type: Object as PropType<
        SavingsMonthBalanceItem | TreasuryMonthBonusesItem
      >,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    navigateToName: {
      type: String,
      required: true
    },
    buttonText: {
      type: String,
      required: true
    },
    inProgressText: {
      required: true
    }
  },
  computed: {
    isInProgress(): boolean {
      const currentDate = dayjs();

      return (
        currentDate.get('year') === this.item.year &&
        currentDate.get('month') + 1 === this.item.month
      );
    },
    currentMonthProgress(): number {
      const currentDate = dayjs().get('date');
      const dayInCurrentMonth = dayjs().daysInMonth();
      return Math.round((currentDate / dayInCurrentMonth) * 100);
    },
    headerText(): string {
      return dateFromExplicitPair(this.item.year, this.item.month).format(
        'MMMM YYYY'
      );
    },
    itemText(): string {
      const dateFrom = dateFromExplicitPair(this.item.year, this.item.month);
      const dateTo = dateFrom.endOf('month');

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
