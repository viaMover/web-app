<template>
  <content-wrapper
    base-class="release-radar-desktop"
    has-back-button
    wrapper-class="release-radar-desktop"
    @close="handleClose"
  >
    <form action="#" class="search-form">
      <input
        name="search"
        placeholder="Search any token on Ethereum"
        type="search"
      />
      <button class="button-active" type="submit">🔍</button>
    </form>
    <release-radar-token-of-the-day />
    <release-radar-live-updates />
    <release-radar-page-section
      :is-loading="isLoadingPersonalList"
      :items="personalList"
      title="Personal Lists"
    />
    <release-radar-page-section
      :is-loading="isLoadingCuratedList"
      :items="curatedList"
      title="Curated Lists"
    />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper } from '@/components/layout';
import {
  ReleaseRadarTokenOfTheDay,
  ReleaseRadarLiveUpdates
} from '@/components/release-radar';
import { ReleaseRadarPageSection } from '@/components/release-radar/release-radar-page-section';
import { mapState } from 'vuex';

export default Vue.extend({
  name: 'ReleaseRadarViewAll',
  components: {
    ContentWrapper,
    ReleaseRadarPageSection,
    ReleaseRadarTokenOfTheDay,
    ReleaseRadarLiveUpdates
  },
  computed: {
    ...mapState('radar', [
      'personalList',
      'curatedList',
      'isLoadingCuratedList',
      'isLoadingPersonalList'
    ])
  },
  methods: {
    handleClose(): void {
      this.$router.push({
        name: 'home'
      });
    }
  }
});
</script>
