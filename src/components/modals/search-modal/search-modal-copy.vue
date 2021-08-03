<template>
  <modal
    close-on-dimmer-click
    disable-body-bottom-padding
    disable-header-bottom-margin
    has-header
    header-html-class="swaps__wrapper-search-form"
    :modal-id="modalId"
    show-close-button
  >
    <template v-slot:header>
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
    </template>

    <div ref="resultsTop" class="swaps__wrapper-search-items">
      <search-modal-token-list :items="filteredTokens" @select="handleSelect" />
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue';

import Modal from '../modal.vue';
import { Modal as ModalType } from '@/store/modules/modals/types';
import SearchModalTokenList from '@/components/modals/search-modal/search-modal-token-list.vue';
import Fuse from 'fuse.js';
import { Token } from '@/wallet/types';
import { mapActions, mapGetters, mapState } from 'vuex';
import { isTokenValidForTreasuryDeposit } from '@/wallet/references/data';
import filter from 'lodash-es/filter';

export default Vue.extend({
  name: 'SearchModalCopy',
  components: {
    Modal,
    SearchModalTokenList
  },
  data() {
    return {
      modalId: ModalType.SearchToken,
      searchTerm: '',
      searchTermDebounced: '',
      debounce: undefined as number | undefined,
      debounceTimeout: 500,
      forcedTokenArraySearcher: undefined as Fuse<Token> | undefined
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
    ...mapState('modals', {
      state: 'state'
    }),
    useWalletTokens(): boolean {
      return this.state[this.modalId].payload?.useWalletTokens ?? false;
    },
    excludedTokens(): Array<Token> {
      return this.state[this.modalId].payload?.excludedTokens ?? [];
    },
    treasuryOnly(): boolean {
      return this.state[this.modalId].payload?.treasuryOnly ?? false;
    },
    forceTokenArray(): Array<Token> {
      return this.state[this.modalId].payload?.forceTokenArray ?? [];
    },
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
    this.initSearcher();
  },
  beforeDestroy() {
    this.forcedTokenArraySearcher = undefined;
    window.clearTimeout(this.debounce);
  },
  methods: {
    ...mapActions('modals', { setIsDisplayed: 'setIsDisplayed' }),
    initSearcher(): void {
      this.forcedTokenArraySearcher = new Fuse<Token>(this.forceTokenArray, {
        keys: ['name', 'symbol'],
        isCaseSensitive: false
      });
    },
    handleSelect(token: Token): void {
      this.state[this.modalId].resolver?.(token);
      this.setIsDisplayed({ id: this.modalId, value: false });
      this.searchTerm = '';
    },
    searchInForcedTokenArray(searchTerm: string): Array<Token> {
      return (
        this.forcedTokenArraySearcher
          ?.search(searchTerm, { limit: 100 })
          .map((res) => res.item) || this.forceTokenArray
      );
    }
  }
});
</script>
