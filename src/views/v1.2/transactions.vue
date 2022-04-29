<template>
  <page class="transactions" has-close-button @close="handleClose">
    <transition name="fade">
      <transactions-list-skeleton v-if="showSkeleton" />
      <div v-else-if="transactionGroups.length === 0" class="empty-state">
        {{ $t('newToMover') }}
      </div>
      <div v-else>
        <transition-group class="list" name="list-transition" tag="div">
          <transactions-list-group
            v-for="txGroup in transactionGroups"
            :key="txGroup.timeStamp"
            class="list-transition-item"
            :timestamp="txGroup.timeStamp"
            :transactions="txGroup.transactions"
          />
        </transition-group>
        <infinite-loading v-if="hasInfiniteLoader" @infinite="infiniteHandler">
          <template v-slot:spinner>
            <img
              :alt="$t('icon.txtPendingIconAlt')"
              src="@/assets/images/ios-spinner.svg"
            />
          </template>
          <template v-slot:no-more>
            {{ $t('noMoreTransactions') }}
          </template>
          <template v-slot:no-results>
            {{ $t('noMoreTransactions') }}
          </template>
        </infinite-loading>
      </div>
    </transition>
  </page>
</template>

<script lang="ts">
import Vue from 'vue';
import InfiniteLoading, { StateChanger } from 'vue-infinite-loading';
import { mapGetters, mapState } from 'vuex';

import Page from '@/components/v1.2/layout/page.vue';
import TransactionsListGroup from '@/components/v1.2/transactions/transactions-list-group.vue';
import TransactionsListSkeleton from '@/components/v1.2/transactions/transactions-list-skeleton.vue';

export default Vue.extend({
  components: {
    Page,
    TransactionsListGroup,
    TransactionsListSkeleton,
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
    handleClose(): void {
      this.$router.back();
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
