<template>
  <transition mode="out-in" name="slide">
    <router-view />
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import {
  addSentryBreadcrumb,
  captureSentryException
} from '@/services/v2/utils/sentry';

export default Vue.extend({
  name: 'GovernanceViewRoot',
  mounted() {
    this.$watch(
      () => this.$route.params.id,
      async (newVal: string | undefined) => {
        if (newVal === undefined) {
          return;
        }

        try {
          const loadedProposal = await this.loadProposalInfoById(newVal);
          if (loadedProposal === undefined) {
            return await this.$router.replace({ name: 'governance-view-all' });
          }
        } catch (error) {
          addSentryBreadcrumb({
            type: 'error',
            category: 'id.$watch.governance-view-root.ui',
            message: 'Failed to obtain / get proposal info by id',
            data: { error, newVal }
          });
          captureSentryException(error);
        }
      },
      { immediate: true }
    );
  },
  methods: {
    ...mapActions('governance', ['loadProposalInfoById'])
  }
});
</script>
