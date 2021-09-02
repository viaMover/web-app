<template>
  <section-base
    container-class="more__wrapper__menu-item"
    has-expand-button
    :heading-text="$t('governance.lblGovernance')"
    :name="$t('governance.lblGovernance')"
    navigate-to-name="governance-view-all"
  >
    <div v-if="lastProposal !== null" class="item__column">
      <div class="item__column-info active">
        <div class="loading">
          <div class="hold left">
            <div class="fill"></div>
          </div>
          <div class="hold right">
            <div class="fill"></div>
          </div>
        </div>
        <div class="item__column-info-icon"><span>🗳</span></div>
        <div class="item__column-info-label">
          <p>{{ lastProposal.name }}</p>
          <span>{{
            $t(`governance.lblVotingStatus.${lastProposal.status}`)
          }}</span>
        </div>
      </div>
      <div class="item__column-link">
        <router-link
          class="black-link button-active"
          :to="{ name: 'governance-view', params: { id: lastProposal.id } }"
        >
          {{ $t('governance.btnVote.simple') }}
        </router-link>
      </div>
    </div>

    <router-link
      class="link button-active"
      :to="{ name: 'governance-view-all' }"
    >
      {{ $t('governance.btnSeeAll.simple') }}
    </router-link>
  </section-base>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import SectionBase from './section-base/section-base.vue';

export default Vue.extend({
  name: 'GovernanceSection',
  components: {
    SectionBase
  },
  computed: {
    ...mapGetters('proposal', ['lastProposal'])
  }
});
</script>
