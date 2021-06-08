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
import { partition } from 'lodash';

import {
  sendResult,
  subToggle,
  TogglePayload,
  unsubToggle
} from '@/components/toggle/toggle-root';
import { TokenGroups } from './types';
import { Modal } from '../modalTypes';

import CenteredModalWindow from '../centered-modal-window.vue';
import SearchModalTokenList from './search-modal-token-list.vue';
import { TokenWithBalance } from '@/store/modules/account/types';

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
      searcher: null as Fuse<TokenWithBalance> | null,
      useWalletTokens: false
    };
  },
  computed: {
    ...mapState('account', { allTokens: 'allTokens', walletTokens: 'tokens' }),
    filteredTokens(): Array<TokenWithBalance> {
      let tokens: Array<TokenWithBalance>;
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

      const [favorite, other] = partition<TokenWithBalance, TokenWithBalance>(
        tokens,
        (t) => t.isFavorite
      );
      const [verified, rest] = partition<TokenWithBalance, TokenWithBalance>(
        other,
        (t) => t.isVerified
      );

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
    subToggle<TokenWithBalance>(this.modalId, this.handleToggle);
    this.initSearcher();
  },
  beforeDestroy() {
    this.searcher = null;
    window.clearTimeout(this.debounce);
    unsubToggle<TokenWithBalance>(this.modalId, this.handleToggle);
  },
  methods: {
    initSearcher(): void {
      this.searcher = new Fuse<TokenWithBalance>(
        this.useWalletTokens ? this.walletTokens : this.allTokens,
        {
          keys: ['name', 'symbol', 'address'],
          isCaseSensitive: false
        }
      );
    },
    handleSelect(token: TokenWithBalance): void {
      sendResult<TokenWithBalance>(this.modalId, token);
      this.searchTerm = '';
    },
    handleToggle(payload: TogglePayload<{ useWalletTokens: boolean }>): void {
      this.useWalletTokens = !!payload.payload?.useWalletTokens;
    }
  }
});
</script>
