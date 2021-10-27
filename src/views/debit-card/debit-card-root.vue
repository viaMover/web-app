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
        <debit-card-manage-card />
      </div>
    </template>

    <router-view />

    <template v-slot:modals>
      <search-modal key="search-modal" />
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import { DebitCardManageCard, DebitCardMyCard } from '@/components/debit-card';
import { ContentWrapper } from '@/components/layout';
import { SearchModal } from '@/components/modals';

export default Vue.extend({
  name: 'DebitCardRoot',
  components: {
    ContentWrapper,
    DebitCardMyCard,
    DebitCardManageCard,
    SearchModal
  },
  async mounted() {
    await this.loadInfo();
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
