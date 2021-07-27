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
      <search-modal-token-list
        has-header
        header-class="favorite"
        :items="tokenGroups.favorite"
        @select="handleSelect"
      >
        <template v-slot:header>
          <img alt="favorite icon" src="@/assets/images/favorite-icon.svg" />
          {{ $t('search.lblFavorite') }}
        </template>
      </search-modal-token-list>
      <search-modal-token-list
        has-header
        header-class="verified"
        :items="tokenGroups.verified"
        @select="handleSelect"
      >
        <template v-slot:header>
          <img alt="verified icon" src="@/assets/images/verified-icon.svg" />
          {{ $t('search.lblVerified') }}
        </template>
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
import filter from 'lodash-es/filter';

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
      searcher: null as Fuse<Token> | null,
      useWalletTokens: false,
      excludedTokens: [] as Array<Token>,
      treasuryOnly: false as boolean
    };
  },
  computed: {
    ...mapState('account', {
      allTokens: 'allTokens',
      walletTokens: 'tokens',
      networkInfo: 'networkInfo'
    }),
    excludedTokenAddresses(): Array<string> {
      return this.excludedTokens.map((et) => et.address.toLowerCase());
    },
    filteredTokens(): Array<Token> {
      let tokens: Array<Token>;
      if (!this.searcher || this.searchTermDebounced === '') {
        tokens = this.useWalletTokens ? this.walletTokens : this.allTokens;
      } else {
        tokens = this.searcher
          .search(this.searchTermDebounced)
          .map((result) => result.item);
      }

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
    useWalletTokens(newVal: boolean, oldVal: boolean): void {
      if (newVal !== oldVal) {
        this.initSearcher();
      }
    },
    allTokens(newVal: Array<Token>, oldVal: Array<Token>): void {
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
    handleToggle(
      payload: TogglePayload<{
        useWalletTokens: boolean;
        excludeTokens: Array<Token>;
        treasuryOnly: boolean;
      }>
    ): void {
      this.useWalletTokens = !!payload.payload?.useWalletTokens;
      this.excludedTokens = payload.payload?.excludeTokens ?? [];
      this.treasuryOnly = !!payload.payload?.treasuryOnly;
    }
  }
});
</script>
