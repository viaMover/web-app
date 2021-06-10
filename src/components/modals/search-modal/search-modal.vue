<template>
  <centered-modal-window :modal-id="modalId">
    <div class="search-bar">
      <label for="token-search">{{ $t('search.lblSearchBar') }}</label>
      <input
        id="token-search"
        v-model.trim="searchTerm"
        name="token-search"
        :placeholder="$t('search.lblSearchBarPlaceholder')"
        type="text"
      />
    </div>

    <div class="search-results">
      <search-modal-token-list
        has-header
        :items="tokenGroups.favorite"
        @select="handleSelect"
      >
        <template v-slot:header>{{ $t('search.lblFavorite') }}</template>
      </search-modal-token-list>
      <search-modal-token-list
        has-header
        :items="tokenGroups.verified"
        @select="handleSelect"
      >
        <template v-slot:header>{{ $t('search.lblVerified') }}</template>
      </search-modal-token-list>
      <search-modal-token-list
        :items="tokenGroups.rest"
        @select="handleSelect"
      />
    </div>
  </centered-modal-window>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import Fuse from 'fuse.js';
import partition from 'lodash-es/partition';

import {
  sendResult,
  subToggle,
  TogglePayload,
  toggleSingleItem,
  unsubToggle
} from '@/components/toggle/toggle-root';
import { TokenGroups } from './types';
import { Modal } from '../modalTypes';

import CenteredModalWindow from '../centered-modal-window.vue';
import SearchModalTokenList from './search-modal-token-list.vue';
import { Token } from '@/store/modules/account/types';

export default Vue.extend({
  name: 'SearchModal',
  components: {
    CenteredModalWindow,
    SearchModalTokenList
  },
  data() {
    return {
      modalId: Modal.SearchToken,
      searchTerm: '',
      searchTermDebounced: '',
      debounce: undefined as number | undefined,
      debounceTimeout: 500,
      searcher: null as Fuse<Token> | null,
      useWalletTokens: false
    };
  },
  computed: {
    ...mapState('account', { allTokens: 'allTokens', walletTokens: 'tokens' }),
    filteredTokens(): Array<Token> {
      let tokens: Array<Token>;
      if (!this.searcher || this.searchTermDebounced === '') {
        tokens = this.useWalletTokens ? this.walletTokens : this.allTokens;
      } else {
        tokens = this.searcher
          .search(this.searchTermDebounced)
          .map((result) => result.item);
      }

      return tokens.slice(0, 100);
    },
    tokenGroups(): TokenGroups {
      const tokens = this.filteredTokens.slice();

      const [favorite, other] = partition(tokens, (t) => t.isFavorite);
      const [verified, rest] = partition(other, (t) => t.isVerified);

      return {
        favorite,
        verified,
        rest
      };
    }
  },
  watch: {
    searchTerm(newVal: string) {
      window.clearTimeout(this.debounce);
      this.debounce = window.setTimeout(() => {
        this.searchTermDebounced = newVal;
      }, this.debounceTimeout);
    },
    useWalletTokens(newVal: boolean, oldVal: boolean): void {
      if (newVal !== oldVal) {
        this.initSearcher();
      }
    }
  },
  beforeMount() {
    subToggle(this.modalId, this.handleToggle);
    this.initSearcher();
  },
  beforeDestroy() {
    this.searcher = null;
    window.clearTimeout(this.debounce);
    unsubToggle(this.modalId, this.handleToggle);
  },
  methods: {
    initSearcher(): void {
      this.searcher = new Fuse<Token>(
        this.useWalletTokens ? this.walletTokens : this.allTokens,
        {
          keys: ['name', 'symbol', 'address'],
          isCaseSensitive: false
        }
      );
    },
    handleSelect(token: Token): void {
      sendResult<Token>(this.modalId, token);
      this.searchTerm = '';
      toggleSingleItem(this.modalId);
    },
    handleToggle(payload: TogglePayload<{ useWalletTokens: boolean }>): void {
      this.useWalletTokens = !!payload.payload?.useWalletTokens;
    }
  }
});
</script>
