<template>
  <heading-section
    class="section governance"
    has-expand-button
    :name="$t('governance.lblGovernance')"
    navigate-to-name="governance-view-all"
  >
    <template v-slot:heading>
      {{ $t('governance.lblGovernance') }}
    </template>

    <div v-if="lastProposal !== null" class="item">
      <div class="image-placeholder">
        <div class="image-placeholder inner"></div>
      </div>
      <div class="text-container">
        <h5>{{ lastProposal.name }}</h5>
        <sub>{{ $t(`governance.lblVotingStatus.${lastProposal.status}`) }}</sub>
      </div>
      <router-link
        button-class="button-primary"
        :to="{ name: 'governance-view', params: { id: lastProposal.id } }"
      >
        {{ $t('governance.btnVote.simple') }}
      </router-link>
    </div>
    <div class="button-container">
      <router-link
        button-class="button-secondary w-100"
        :to="{ name: 'governance-view-all' }"
      >
        {{ $t('governance.btnSeeAll.simple') }}
      </router-link>
    </div>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';

import HeadingSection from './heading-section.vue';
import { mapGetters } from 'vuex';

export default Vue.extend({
  name: 'GovernanceSection',
  components: {
    HeadingSection
  },
  computed: {
    ...mapGetters('proposal', ['lastProposal'])
  }
});
</script>
