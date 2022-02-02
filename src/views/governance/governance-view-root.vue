<template>
  <router-view />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

export default Vue.extend({
  name: 'GovernanceViewRoot',
  computed: {
    ...mapGetters('governance', {
      proposalsIds: 'proposalsIds'
    }),
    pageProposalId(): string {
      return this.$route.params.id;
    }
  },
  async mounted() {
    await this.loadGovernanceInfo();
    if (this.proposalsIds.includes(this.pageProposalId)) {
      return;
    }

    await this.$router.replace({ name: 'governance-view-all' });
  },
  methods: {
    ...mapActions('governance', {
      loadGovernanceInfo: 'loadGovernanceInfo'
    })
  }
});
</script>
