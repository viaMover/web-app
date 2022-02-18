<template>
  <transition mode="out-in" name="slide">
    <router-view />
  </transition>
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
    await this.loadInfo();
    if (this.proposalsIds.includes(this.pageProposalId)) {
      return;
    }

    await this.$router.replace({ name: 'governance-view-all' });
  },
  methods: {
    ...mapActions('governance', {
      loadInfo: 'loadInfo'
    })
  }
});
</script>
