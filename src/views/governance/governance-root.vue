<template>
  <content-wrapper
    class="governance"
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <router-view name="leftRail" />
    </template>

    <transition mode="out-in" name="fade">
      <router-view />
    </transition>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import { ContentWrapper } from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceRoot',
  components: {
    ContentWrapper
  },
  watch: {
    $route: {
      async handler() {
        await this.loadVotingPowerSelf();
      }
    }
  },
  async mounted() {
    await this.loadGovernanceInfo();
  },
  methods: {
    ...mapActions('governance', {
      loadGovernanceInfo: 'loadGovernanceInfo',
      loadVotingPowerSelf: 'loadCurrentVotingPowerSelf'
    }),
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
