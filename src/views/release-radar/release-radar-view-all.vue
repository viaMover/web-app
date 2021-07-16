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
      title="Personal lists"
    ></release-radar-page-section>
    <release-radar-page-section
      title="Curated lists"
    ></release-radar-page-section>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper } from '@/components/layout';
import {
  ReleaseRadarPageSection,
  ReleaseRadarTokenOfTheDay,
  ReleaseRadarLiveUpdates
} from '@/components/release-radar';

export default Vue.extend({
  name: 'ReleaseRadarViewAll',
  components: {
    ContentWrapper,
    ReleaseRadarPageSection,
    ReleaseRadarTokenOfTheDay,
    ReleaseRadarLiveUpdates
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
