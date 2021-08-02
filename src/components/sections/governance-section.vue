<template>
  <heading-section
    class="general-desktop__menu-wrapper-item"
    container-class="general-desktop__menu-wrapper-item-info"
    has-expand-button
    :name="$t('governance.lblGovernance')"
    navigate-to-name="governance-view-all"
  >
    <template v-slot:heading>
      {{ $t('governance.lblGovernance') }}
    </template>

    <template v-slot:bottom>
      <div v-if="lastProposal !== null" class="vote">
        <div class="vote__info">
          <div class="loading">
            <div class="hold left">
              <div class="fill"></div>
            </div>
            <div class="hold right">
              <div class="fill"></div>
            </div>
          </div>
          <div class="vote__info-icon"><span>🗳</span></div>
          <div class="vote__info-label">
            <p>{{ lastProposal.name }}</p>
            <span>{{
              $t(`governance.lblVotingStatus.${lastProposal.status}`)
            }}</span>
          </div>
        </div>
        <div class="vote__link">
          <router-link
            :to="{ name: 'governance-view', params: { id: lastProposal.id } }"
          >
            <action-button class="black-link button-active">
              {{ $t('governance.btnVote.simple') }}
            </action-button>
          </router-link>
        </div>
      </div>
      <div class="vote__link-all button-active">
        <router-link :to="{ name: 'governance-view-all' }">
          {{ $t('governance.btnSeeAll.simple') }}
        </router-link>
      </div>
    </template>
  </heading-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import HeadingSection from './heading-section.vue';
import ActionButton from '@/components/buttons/action-button.vue';

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
