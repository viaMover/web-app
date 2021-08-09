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
      <search-modal-token-list
        v-if="forceTokenArray.length > 0"
        :items="forcedTokens"
        @select="handleSelect"
      />
      <template v-else>
        <search-modal-token-list
          :header-text="$t('search.lblTokensInTheWallet')"
          :items="walletTokens"
          :show-header="!useWalletTokens && walletTokens.length > 0"
          @select="handleSelect"
        />
        <search-modal-token-list
          :header-text="$t('search.lblGlobalSearch')"
          :items="globalTokens"
          :show-header="!useWalletTokens && globalTokens.length > 0"
          @select="handleSelect"
        />
      </template>
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState, mapActions } from 'vuex';
import Fuse from 'fuse.js';
import filter from 'lodash-es/filter';

import { Modal as ModalType } from '@/store/modules/modals/types';

import SearchModalTokenList from './search-modal-token-list.vue';
import { Token } from '@/wallet/types';
import { isTokenValidForTreasuryDeposit } from '@/wallet/references/data';
import Modal from '../modal.vue';

export default Vue.extend({
  name: 'SearchModal',
  components: {
    Modal,
    SearchModalTokenList
  },
  data() {
    return {
      modalId: ModalType.SearchToken,
      modalClass: 'swaps__wrapper transaction__popup-wrapper',
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
    walletTokens(): Array<Token> {
      if (this.forceTokenArray.length > 0) {
        return [];
      }

      return this.filterTokens(
        this.searchInWalletTokens(this.searchTermDebounced)
      );
    },
    globalTokens(): Array<Token> {
      if (this.useWalletTokens || this.forceTokenArray.length > 0) {
        return [];
      }

      return this.filterTokens(
        this.searchInAllTokens(this.searchTermDebounced)
      );
    },
    forcedTokens(): Array<Token> {
      if (this.useWalletTokens) {
        return [];
      }

      return this.filterTokens(
        this.searchInForcedTokenArray(this.searchTermDebounced)
      );
    }
  },
  watch: {
    searchTerm(newVal: string) {
      window.clearTimeout(this.debounce);

      const debounceTimeout = newVal === '' ? 0 : this.debounceTimeout;

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
      }, debounceTimeout);
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
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
    initSearcher(): void {
      this.forcedTokenArraySearcher = new Fuse<Token>(this.forceTokenArray, {
        keys: ['name', 'symbol'],
        isCaseSensitive: false
      });
    },
    handleSelect(token: Token): void {
      this.state[this.modalId].resolver?.(token);
      this.setIsModalDisplayed({ id: this.modalId, value: false });
      this.searchTerm = '';
    },
    searchInForcedTokenArray(searchTerm: string): Array<Token> {
      return (
        this.forcedTokenArraySearcher
          ?.search(searchTerm, { limit: 100 })
          .map((res) => res.item) || this.forceTokenArray
      );
    },
    filterTokens(tokens: Array<Token>): Array<Token> {
      let result = tokens.slice();

      if (this.treasuryOnly) {
        result = result.filter((t) =>
          isTokenValidForTreasuryDeposit(t.address, this.networkInfo.network)
        );
      }

      if (this.excludedTokenAddresses.length > 0) {
        result = filter(
          result,
          (t) =>
            !this.excludedTokenAddresses.some(
              (et) => t.address.toLowerCase() === et
            )
        );
      }

      return result;
    }
  }
});
</script>
