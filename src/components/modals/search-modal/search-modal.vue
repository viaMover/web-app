<template>
  <modal
    close-on-dimmer-click
    disable-body-bottom-padding
    disable-header-bottom-margin
    has-header
    header-html-class="swaps__wrapper-search-form"
    :modal-id="modalId"
    :show-close-button="showCloseButton"
    @close="handleSelect(undefined)"
  >
    <template v-slot:header>
      <h3 class="modal-wrapper-info-title">Search</h3>
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
      <template v-if="totalResultsLength > 0">
        <search-modal-token-list
          v-if="forceTokenArray.length > 0"
          :items="forcedTokens"
          show-balances
          @select="handleSelect"
        />
        <template v-else>
          <search-modal-token-list
            :header-text="$t('search.lblTokensInTheWallet')"
            :items="walletTokens"
            show-balances
            :show-header="walletTokens.length > 0"
            @select="handleSelect"
          />
          <search-modal-token-list
            v-if="showGlobalTokens"
            :header-text="$t('search.lblGlobalSearch')"
            infinity-load
            :items="globalTokensData"
            :show-header="showGlobalTokens"
            @load-more="handleGlobalLoadMore"
            @select="handleSelect"
          />
        </template>
      </template>
      <div v-else class="no-tokens">
        <span class="icon">👻</span>
        <h4>{{ $t('lblOhSnap') }}</h4>
        <p>{{ $t('txtCouldNotFindToken') }}</p>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { StateChanger } from 'vue-infinite-loading';
import { mapActions, mapGetters, mapState } from 'vuex';

import filter from 'lodash-es/filter';

import {
  Modal as ModalType,
  TModalPayload
} from '@/store/modules/modals/types';
import { isTokenValidForTreasuryDeposit } from '@/wallet/references/data';
import { Token, TokenWithBalance } from '@/wallet/types';

import Modal from '../modal.vue';
import SearchModalTokenList from './search-modal-token-list.vue';

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
      forcedTokenArrayData: [] as Array<Token>,
      globalTokensData: [] as Array<Token>,
      globalsTokensDataOffset: 0,
      marketCapSortLimit: 1000000,
      showCloseButton: true
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
    modalPayload(): boolean {
      return this.state[this.modalId].payload;
    },
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
    walletTokens(): Array<TokenWithBalance> {
      if (this.forceTokenArray.length > 0) {
        return [];
      }

      return this.filterTokens(
        this.searchInWalletTokens(this.searchTermDebounced).sort(
          (a: Token, b: Token) => {
            if (
              a.marketCap > this.marketCapSortLimit &&
              b.marketCap > this.marketCapSortLimit
            ) {
              if (a.marketCap > b.marketCap) {
                return -1;
              }
              if (a.marketCap < b.marketCap) {
                return 1;
              }
            } else if (a.marketCap > this.marketCapSortLimit) {
              return -1;
            } else if (b.marketCap > this.marketCapSortLimit) {
              return 1;
            }

            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          }
        )
      );
    },
    showGlobalTokens(): boolean {
      if (this.useWalletTokens || this.forceTokenArray.length > 0) {
        return false;
      }
      return true;
    },
    forcedTokens(): Array<Token> {
      if (this.forceTokenArray.length === 0) {
        return [];
      }

      return this.filterTokens(
        this.searchInForcedTokenArray(this.searchTermDebounced).sort((a, b) => {
          if (
            a.marketCap > this.marketCapSortLimit &&
            b.marketCap > this.marketCapSortLimit
          ) {
            if (a.marketCap > b.marketCap) {
              return -1;
            }
            if (a.marketCap < b.marketCap) {
              return 1;
            }
          } else if (a.marketCap > this.marketCapSortLimit) {
            return -1;
          } else if (b.marketCap > this.marketCapSortLimit) {
            return 1;
          }

          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        })
      );
    },
    totalResultsLength(): number {
      return (
        this.forcedTokens.length +
        this.walletTokens.length +
        this.globalTokensData.length
      );
    }
  },
  watch: {
    searchTerm(newVal: string) {
      window.clearTimeout(this.debounce);

      const debounceTimeout = newVal === '' ? 0 : this.debounceTimeout;

      this.debounce = window.setTimeout(() => {
        this.searchTermDebounced = newVal;
        this.globalTokensData = [];
        this.globalsTokensDataOffset = 0;
        this.globalTokensData = this.filterTokens(
          this.searchInAllTokens(
            this.searchTermDebounced,
            this.globalsTokensDataOffset
          )
        );

        this.$nextTick().then(() => {
          if (!this.$refs.resultsTop) {
            return;
          }

          this.$refs.resultsTop.scroll({ top: 0 });
        });
      }, debounceTimeout);
    },
    modalPayload(newVal: TModalPayload<ModalType.SearchToken> | undefined) {
      if (newVal === undefined) {
        return;
      }

      this.showCloseButton = !newVal.hideCloseButton;

      this.globalTokensData = [];
      this.globalsTokensDataOffset = 0;

      this.globalTokensData = this.filterTokens(
        this.searchInAllTokens(
          this.searchTermDebounced,
          this.globalsTokensDataOffset
        )
      );
    }
  },
  beforeDestroy() {
    window.clearTimeout(this.debounce);
  },
  methods: {
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
    handleSelect(token: Token | undefined): void {
      this.state[this.modalId].resolver?.(token);
      this.setIsModalDisplayed({ id: this.modalId, value: false });
      window.clearTimeout(this.debounce);
      this.searchTerm = '';
      this.searchTermDebounced = '';
    },
    handleGlobalLoadMore($state: StateChanger): void {
      if (this.searchTermDebounced) {
        $state.reset();
        return;
      }
      const newData = this.filterTokens(
        this.searchInAllTokens(
          this.searchTermDebounced,
          this.globalsTokensDataOffset + 100
        )
      );
      if (newData.length > 0) {
        $state.loaded();
      } else {
        $state.complete();
      }
      this.globalTokensData.push(...newData);
      this.globalsTokensDataOffset = this.globalsTokensDataOffset + 100;
    },
    searchInForcedTokenArray(searchTerm: string): Array<Token> {
      if (searchTerm === '') {
        return this.forceTokenArray;
      }

      return this.forceTokenArray.filter(
        (t) =>
          t.symbol.toLowerCase().includes(searchTerm) ||
          t.name.toLowerCase().includes(searchTerm)
      );
    },
    filterTokens<T extends TokenWithBalance | Token>(
      tokens: Array<T>
    ): Array<T> {
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
