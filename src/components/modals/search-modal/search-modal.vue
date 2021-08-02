<template>
  <centered-modal-window
    :header-label="$t('search.lblSearch')"
    :modal-class="modalClass"
    :modal-id="modalId"
  >
    <div class="swaps__wrapper-search-form">
      <form class="search-form" @submit.prevent.stop="">
        <input
          v-model.trim="searchTerm"
          name="token-search"
          :placeholder="$t('search.lblSearchBarPlaceholder')"
          type="search"
        />
        <button class="button-active" type="button" @click.prevent.stop="">
          🔍
        </button>
      </form>
    </div>

    <div ref="resultsTop" class="swaps__wrapper-search-items">
      <search-modal-token-list :items="filteredTokens" @select="handleSelect" />
    </div>
  </centered-modal-window>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import Fuse from 'fuse.js';
import filter from 'lodash-es/filter';

import {
  sendResult,
  subToggle,
  TogglePayload,
  toggleSingleItem,
  unsubToggle
} from '@/components/toggle/toggle-root';
import { Modal } from '../modalTypes';

import CenteredModalWindow from '../centered-modal-window.vue';
import SearchModalTokenList from './search-modal-token-list.vue';
import { Token } from '@/wallet/types';
import { isTokenValidForTreasuryDeposit } from '@/wallet/references/data';

export default Vue.extend({
  name: 'SearchModal',
  components: {
    CenteredModalWindow,
    SearchModalTokenList
  },
  data() {
    return {
      modalId: Modal.SearchToken,
      modalClass: 'swaps__wrapper transaction__popup-wrapper',
      searchTerm: '',
      searchTermDebounced: '',
      debounce: undefined as number | undefined,
      debounceTimeout: 500,
      forcedTokenArraySearcher: undefined as Fuse<Token> | undefined,
      useWalletTokens: false,
      excludedTokens: [] as Array<Token>,
      treasuryOnly: false as boolean,
      forceTokenArray: [] as Array<Token>
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo'
    }),
    ...mapGetters('account', {
      searchInAllTokens: 'searchInAllTokens',
      searchInWalletTokens: 'searchInWalletTokens'
    }),
    excludedTokenAddresses(): Array<string> {
      return this.excludedTokens.map((et) => et.address.toLowerCase());
    },
    filteredTokens(): Array<Token> {
      let searcher: (searchTerm: string) => Array<Token>;
      if (this.forceTokenArray.length > 0) {
        searcher = this.searchInForcedTokenArray;
      } else if (this.useWalletTokens) {
        searcher = this.searchInWalletTokens;
      } else {
        searcher = this.searchInAllTokens;
      }

      let tokens: Array<Token> = searcher(this.searchTermDebounced);

      if (this.treasuryOnly) {
        tokens = tokens.filter((t) =>
          isTokenValidForTreasuryDeposit(t.address, this.networkInfo.network)
        );
      }

      if (this.excludedTokenAddresses.length > 0) {
        tokens = filter(
          tokens,
          (t) =>
            !this.excludedTokenAddresses.some(
              (et) => t.address.toLowerCase() === et
            )
        );
      }

      return tokens;
    }
  },
  watch: {
    searchTerm(newVal: string) {
      window.clearTimeout(this.debounce);
      this.debounce = window.setTimeout(() => {
        this.searchTermDebounced = newVal;

        this.$nextTick().then(() => {
          if (!this.$refs.resultsTop) {
            return;
          }

          this.$refs.resultsTop.scroll({
            top: 0
          });
        });
      }, this.debounceTimeout);
    },
    forceTokenArray(newVal: Array<Token>, oldVal: Array<Token>) {
      if (newVal === oldVal) {
        return;
      }

      this.initSearcher();
    }
  },
  beforeMount() {
    subToggle(this.modalId, this.handleToggle);
    this.initSearcher();
  },
  beforeDestroy() {
    this.forcedTokenArraySearcher = undefined;
    window.clearTimeout(this.debounce);
    unsubToggle(this.modalId, this.handleToggle);
  },
  methods: {
    initSearcher(): void {
      this.forcedTokenArraySearcher = new Fuse<Token>(this.forceTokenArray, {
        keys: ['name', 'symbol'],
        isCaseSensitive: false
      });
    },
    handleSelect(token: Token): void {
      sendResult<Token>(this.modalId, token);
      this.searchTerm = '';
      toggleSingleItem(this.modalId);
    },
    searchInForcedTokenArray(searchTerm: string): Array<Token> {
      return (
        this.forcedTokenArraySearcher
          ?.search(searchTerm, { limit: 100 })
          .map((res) => res.item) || this.forceTokenArray
      );
    },
    handleToggle(
      payload: TogglePayload<{
        useWalletTokens: boolean;
        excludeTokens: Array<Token>;
        treasuryOnly: boolean;
        forceTokenArray: Array<Token>;
      }>
    ): void {
      this.useWalletTokens = !!payload.payload?.useWalletTokens;
      this.excludedTokens = payload.payload?.excludeTokens ?? [];
      this.treasuryOnly = !!payload.payload?.treasuryOnly;
      this.forceTokenArray = payload.payload?.forceTokenArray ?? [];
    }
  }
});
</script>
