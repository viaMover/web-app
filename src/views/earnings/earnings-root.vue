<template>
  <content-wrapper
    base-class="info__wrapper"
    has-close-button
    has-left-rail
    page-container-class=""
    wrapper-class="earnings"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <div class="progressive-left-rail">
        <earnings-nav-left-rail-item />
        <router-view name="manage" />
      </div>
    </template>

    <transition mode="out-in" name="fade">
      <router-view />
    </transition>

    <template v-slot:modals>
      <search-modal key="search-modal" />
    </template>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import { EarningsNavLeftRailItem } from '@/components/earnings';
import { ContentWrapper } from '@/components/layout';
import { SearchModal } from '@/components/modals';

export default Vue.extend({
  name: 'EarningsRoot',
  components: {
    ContentWrapper,
    EarningsNavLeftRailItem,
    SearchModal
  },
  async mounted() {
    await this.loadMinimalInfo();
  },
  methods: {
    ...mapActions('earnings', {
      loadMinimalInfo: 'loadMinimalInfo'
    }),
    handleClose() {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
