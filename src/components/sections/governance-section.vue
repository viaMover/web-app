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
        <span class="heading">{{ lastProposal.name }}</span>
        <span class="sub-heading">{{
          $t(`governance.lblVotingStatus.${lastProposal.status}`)
        }}</span>
      </div>
      <router-link
        :to="{ name: 'governance-view', params: { id: lastProposal.id } }"
      >
        <action-button class="button-primary">
          {{ $t('governance.btnVote.simple') }}
        </action-button>
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
import ActionButton from '../buttons/action-button.vue';

export default Vue.extend({
  name: 'GovernanceSection',
  components: {
    HeadingSection,
    ActionButton
  },
  computed: {
    ...mapGetters('proposal', ['lastProposal'])
  }
});
</script>
