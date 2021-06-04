<template>
  <centered-modal-window :modal-id="modalId" @toggle="handleToggle">
    <div class="search-bar">
      <label for="token-search">{{ $t('search.lblSearchBar') }}</label>
      <input
        id="token-search"
        v-model="searchTerm"
        name="token-search"
        :placeholder="$t('search.lblSearchBarPlaceholder')"
        type="text"
      />
    </div>
    <div v-if="filteredTokens.favourite.length"></div>
    <div v-if="filteredTokens.verified.length"></div>
    <div v-if="filteredTokens.rest.length"></div>
  </centered-modal-window>
</template>

<script lang="ts">
import Vue from 'vue';

import CenteredModalWindow from './centered-modal-window.vue';
import {
  subToggle,
  TogglePayload,
  unsubToggle
} from '@/components/toggle/toggle-root';

export default Vue.extend({
  name: 'SearchModal',
  components: {
    CenteredModalWindow
  },
  data() {
    return {
      modalId: 'search-modal',
      resultPromise: null as Promise<any> | null,
      searchTerm: ''
    };
  },
  mounted() {
    subToggle(this.modalId, this.handleToggle);
  },
  beforeDestroy() {
    unsubToggle(this.modalId, this.handleToggle);
  },
  methods: {
    async handleToggle(payload: TogglePayload<void>): Promise<void> {
      this.searchTerm = '';
    }
  }
});
</script>
