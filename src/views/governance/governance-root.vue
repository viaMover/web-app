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

import {
  addSentryBreadcrumb,
  captureSentryException
} from '@/services/v2/utils/sentry';

import { ContentWrapper } from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceRoot',
  components: {
    ContentWrapper
  },
  watch: {
    $route: {
      handler() {
        Promise.allSettled([
          this.loadCurrentVotingInfo(),
          this.loadProposalInfoList()
        ]).catch((error) => {
          addSentryBreadcrumb({
            type: 'error',
            category: 'handler.$route.watch.governance-root.ui',
            message: 'Failed to update governance root state',
            data: { error }
          });

          captureSentryException(error);
        });
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('governance', [
      'loadCurrentVotingInfo',
      'loadProposalInfoList'
    ]),
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
