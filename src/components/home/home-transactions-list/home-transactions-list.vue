<template>
  <transition name="fade">
    <home-transactions-list-skeleton v-if="showSkeleton" />
    <div v-else-if="transactionGroups.length === 0" class="empty-state">
      {{ $t('lblNewToMover') }}
    </div>
    <div v-else>
      <transition-group class="list" name="list-transition" tag="div">
        <home-transactions-list-group
          v-for="txGroup in transactionGroups"
          :key="txGroup.timeStamp"
          class="list-transition-item"
          :heading-text="formatDate(txGroup.timeStamp)"
          :transactions="txGroup.transactions"
        />
      </transition-group>
      <infinite-loading v-if="hasInfiniteLoader" @infinite="infiniteHandler" />
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import InfiniteLoading, { StateChanger } from 'vue-infinite-loading';
import { mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import HomeTransactionsListGroup from './home-transactions-list-group.vue';
import HomeTransactionsListSkeleton from './home-transactions-list-skeleton.vue';

export default Vue.extend({
  name: 'HomeTransactionsList',
  components: {
    HomeTransactionsListGroup,
    HomeTransactionsListSkeleton,
    InfiniteLoading
  },
  computed: {
    ...mapGetters('account', {
      transactionGroups: 'transactionsGroupedByDay'
    }),
    ...mapState('account', [
      'networkInfo',
      'isTransactionsListLoaded',
      'explorer'
    ]),
    showSkeleton(): boolean {
      return (
        !this.isTransactionsListLoaded && this.transactionGroups.length === 0
      );
    },
    hasInfiniteLoader(): boolean {
      return this.explorer?.hasInfiniteLoader() ?? false;
    }
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
      return date.format('DD MMMM');
    },
    async infiniteHandler(state: StateChanger): Promise<void> {
      if (this.transactionGroups.length === 0) {
        state.complete();
        return;
      }

      const explorer = this.explorer;
      if (explorer === undefined) {
        state.complete();
        return;
      }

      const hasMoreResults = await explorer.loadMoreTransactions();

      if (hasMoreResults) {
        state.loaded();
      } else {
        state.complete();
      }
    }
  }
});
</script>
