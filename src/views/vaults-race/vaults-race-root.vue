<template>
  <content-wrapper
    has-close-button
    has-left-rail
    is-black-close-button
    left-rail-inner-wrapper-class="page-sidebar-wrapper"
    wrapper-class="vaults-race"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <keep-alive>
        <component :is="'vaults-race-left-rail'" />
      </keep-alive>
    </template>

    <router-view />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper } from '@/components/layout';
import { VaultsRaceLeftRail } from '@/components/vaults-race';

import '@/styles/_games.less';

export default Vue.extend({
  name: 'VaultsRaceRoot',
  components: {
    ContentWrapper,
    VaultsRaceLeftRail
  },
  methods: {
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
