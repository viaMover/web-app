<template>
  <div class="wrapper">
    <form class="form search" @submit.prevent.stop="">
      <input
        v-model.trim="searchTerm"
        class="search-term"
        name="transaction-search"
        :placeholder="$t('search.lblSearchTransaction')"
        type="search"
      />
      <button class="icon" type="submit">🔍</button>
    </form>

    <div v-if="!transactionGroups.length" class="empty-state">
      {{ $t('lblConnectWalletTransactionHistory') }}
    </div>
    <transition-group v-else class="list" name="list-transition" tag="div">
      <transaction-group
        v-for="txGroup in filteredTransactionGroups"
        :key="txGroup.timeStamp"
        class="list-transition-item"
        :heading-text="formatDate(txGroup.timeStamp)"
        :transactions="txGroup.transactions"
      />
    </transition-group>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import { getTransactionHumanType } from '@/services/mover/transactions/mapper';
import { TransactionGroup as TransactionGroupType } from '@/store/modules/account/types';
import { tryToGetTransactionAssetSymbol } from '@/store/modules/account/utils/transactions';
import { isValidTxHash, sameAddress } from '@/utils/address';
import { Transaction } from '@/wallet/types';

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
    }),
    ...mapState('account', ['networkInfo']),
    filteredTransactionGroups(): Array<TransactionGroupType> {
      let searchType = 'byName';
      if (isValidTxHash(this.searchTermDebounced)) {
        searchType = 'byAddress';
      }
      return this.transactionGroups
        .map((t: TransactionGroupType) => {
          const txns = t.transactions.filter((tx: Transaction) => {
            if (searchType === 'byName') {
              const moverHeader = getTransactionHumanType(
                tx,
                this.networkInfo.network
              ).toUpperCase();
              const isSubstringOfMoverHeader =
                moverHeader.indexOf(this.searchTermDebounced.toUpperCase()) !==
                -1;

              let translatedMoverHeader: string | undefined;
              if (this.$te(`transactionTypes.${moverHeader.toLowerCase()}`)) {
                translatedMoverHeader = (
                  this.$t(
                    `transactionTypes.${moverHeader.toLowerCase()}`
                  ) as string
                ).toUpperCase();
              }

              const isSubstringOfTranslatedMoverHeader =
                translatedMoverHeader !== undefined &&
                translatedMoverHeader.indexOf(
                  this.searchTermDebounced.toUpperCase()
                ) !== -1;

              const isSubstringOfAssetSymbol =
                tryToGetTransactionAssetSymbol(tx).indexOf(
                  this.searchTermDebounced.toUpperCase()
                ) !== -1;

              return (
                isSubstringOfMoverHeader ||
                isSubstringOfTranslatedMoverHeader ||
                isSubstringOfAssetSymbol
              );
            } else {
              return sameAddress(tx.hash, this.searchTermDebounced);
            }
          });

          return {
            timeStamp: t.timeStamp,
            transactions: txns
          };
        })
        .filter((t: TransactionGroupType) => t.transactions.length > 0);
    }
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
