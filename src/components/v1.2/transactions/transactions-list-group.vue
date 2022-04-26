<template>
  <section class="group transactions">
    <h2 class="header">{{ headingText }}</h2>
    <transition-group class="items" name="list-transition" tag="div">
      <group-item
        v-for="tx in transactions"
        :key="tx.uniqHash"
        class="list-transition-item"
        :transaction="tx"
      />
    </transition-group>
  </section>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import dayjs from 'dayjs';

import { Transaction } from '@/wallet/types';

import GroupItem from './transactions-list-group-item.vue';

export default Vue.extend({
  name: 'TransactionsListGroup',
  components: {
    GroupItem
  },
  props: {
    transactions: {
      type: Array as PropType<Array<Transaction>>,
      required: true
    },
    timestamp: {
      type: Number,
      required: true
    }
  },
  computed: {
    headingText(): string {
      const date = dayjs.unix(this.timestamp);

      if (dayjs().diff(date, 'days') <= 1) {
        return date.calendar(undefined, {
          sameDay: this.$t('dates.sameDay'),
          lastDay: this.$t('dates.lastDay')
        });
      }
      return date.format('DD MMMM');
    }
  }
});
</script>
