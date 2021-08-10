<template>
  <div>
    <form class="transaction-search-form" @submit.prevent.stop="">
      <input
        v-model.trim="searchTerm"
        name="transaction-search"
        :placeholder="$t('search.lblSearchTransaction')"
        type="search"
      />
      <button class="button-active" type="button" @click.prevent.stop="">
        🔍
      </button>
    </form>
    <div class="transactions-list">
      <div v-if="!transactionGroups.length" class="empty-state">
        {{ $t('lblConnectWalletTransactionHistory') }}
      </div>
      <transaction-group
        v-for="txGroup in transactionGroups"
        v-else
        :key="txGroup.date"
        :heading-text="formatDate(txGroup.timeStamp)"
        :transactions="txGroup.transactions"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import dayjs from 'dayjs';

import TransactionGroup from './transaction-group.vue';

export default Vue.extend({
  name: 'TransactionList',
  components: {
    TransactionGroup
  },
  data() {
    return {
      searchTerm: '',
      searchTermDebounced: '',
      debounce: undefined as number | undefined,
      debounceTimeout: 500
    };
  },
  computed: {
    ...mapGetters('account', {
      transactionGroups: 'transactionsGroupedByDay'
    })
  },
  watch: {
    searchTerm(newVal: string) {
      window.clearTimeout(this.debounce);
      this.debounce = window.setTimeout(() => {
        this.searchTermDebounced = newVal;
      }, this.debounceTimeout);
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
    }
  }
});
</script>
