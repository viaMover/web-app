<template>
  <router-view />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

export default Vue.extend({
  name: 'GovernanceRoot',
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
    ...mapActions('proposal', {
      loadGovernanceInfo: 'loadGovernanceInfo',
      loadVotingPowerSelf: 'loadVotingPowerSelf'
    })
  }
});
</script>
