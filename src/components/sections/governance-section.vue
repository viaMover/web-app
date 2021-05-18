<template>
  <heading-section
    class="section governance"
    has-expand-button
    :name="$t('lblGovernance')"
    navigate-to-name="governance"
  >
    <template v-slot:heading>
      {{ $t('lblGovernance') }}
    </template>

    <div class="item">
      <div class="image-placeholder">
        <div class="image-placeholder inner"></div>
      </div>
      <div class="text-container">
        <h5>Governance Analysis Period</h5>
        <sub>Voting is open</sub>
      </div>
      <action-button button-class="button-primary">{{
        $t('btnVote')
      }}</action-button>
    </div>
    <div class="button-container">
      <action-button button-class="button-secondary w-100">
        {{ $t('btnSeeAll') }}
      </action-button>
    </div>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';

import HeadingSection from './heading-section.vue';
import ActionButton from '../buttons/action-button.vue';

export default Vue.extend({
  name: 'GovernanceSection',
  components: {
    HeadingSection,
    ActionButton
  }
});
</script>
