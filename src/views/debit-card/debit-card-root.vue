<template>
  <content-wrapper
    base-class="info__wrapper"
    has-close-button
    has-left-rail
    is-black-close-button
    page-container-class=""
    wrapper-class="debit-card"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <div class="progressive-left-rail">
        <debit-card-my-card />
        <debit-card-manage-card v-if="showManageCard" />
      </div>
    </template>

    <router-view />

    <template v-slot:modals>
      <search-skin-modal key="search-skin-modal" />
      <search-modal key="search-token-modal" />
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { DebitCardManageCard, DebitCardMyCard } from '@/components/debit-card';
import { ContentWrapper } from '@/components/layout';
import { SearchModal, SearchSkinModal } from '@/components/modals';

import '@/styles/_debit-card.less';

export default Vue.extend({
  name: 'DebitCardRoot',
  components: {
    ContentWrapper,
    DebitCardMyCard,
    DebitCardManageCard,
    SearchSkinModal,
    SearchModal
  },
  computed: {
    ...mapState('debitCard', {
      cardState: 'cardState'
    }),
    showManageCard(): boolean {
      return ['active', 'frozen', 'expired'].includes(this.cardState);
    }
  },
  async mounted() {
    await this.loadInfo(true);
  },
  methods: {
    ...mapActions('debitCard', {
      loadInfo: 'loadInfo'
    }),
    handleClose() {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
