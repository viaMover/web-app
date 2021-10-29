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
      <h3 class="modal-wrapper-info-title">{{ $t('debitCard.lblSkins') }}</h3>
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
      <template v-if="results.length > 0">
        <search-skin-modal-list
          :items="results"
          show-balances
          @select="handleSelect"
        />
      </template>
      <div v-else class="no-tokens">
        <span class="icon">👻</span>
        <h4>{{ $t('lblOhSnap') }}</h4>
        <p>{{ $t('debitCard.txtCouldNotFindSkin') }}</p>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { Skin } from '@/store/modules/debit-card/types';
import {
  Modal as ModalType,
  TModalPayload
} from '@/store/modules/modals/types';

import Modal from '../modal.vue';
import SearchSkinModalList from './search-skin-modal-list.vue';

export default Vue.extend({
  name: 'SearchTokenModal',
  components: {
    Modal,
    SearchSkinModalList
  },
  data() {
    return {
      modalId: ModalType.SearchSkin,
      modalClass: 'swaps__wrapper transaction__popup-wrapper',
      searchTerm: '',
      searchTermDebounced: '',
      debounce: undefined as number | undefined,
      debounceTimeout: 500,
      showCloseButton: true
    };
  },
  computed: {
    ...mapGetters('debitCard', {
      searchInAvailableSkins: 'searchInAvailableSkins'
    }),
    ...mapState('modals', {
      state: 'state'
    }),
    modalPayload(): boolean {
      return this.state[this.modalId].payload;
    },
    results(): Array<Skin> {
      return this.searchInAvailableSkins(this.searchTermDebounced);
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

          this.$refs.resultsTop.scroll({ top: 0 });
        });
      }, debounceTimeout);
    },
    modalPayload(newVal: TModalPayload<ModalType.SearchSkin> | undefined) {
      if (newVal === undefined) {
        return;
      }

      this.showCloseButton = !newVal.hideCloseButton;
    }
  },
  beforeDestroy() {
    window.clearTimeout(this.debounce);
  },
  methods: {
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
    handleSelect(skin: Skin | undefined): void {
      this.state[this.modalId].resolver?.(skin);
      this.setIsModalDisplayed({ id: this.modalId, value: false });
      window.clearTimeout(this.debounce);
      this.searchTerm = '';
      this.searchTermDebounced = '';
    }
  }
});
</script>
