<template>
  <content-wrapper
    base-class="release-radar-desktop"
    has-back-button
    wrapper-class="release-radar-desktop"
    @close="handleClose"
  >
    <form action="#" class="search-form">
      <input
        :name="$t('search.lblSearch')"
        :placeholder="$t('search.lblSearchBarPlaceholder')"
        type="search"
      />
      <button class="button-active" type="submit">
        {{ $t('radar.btnSearch.emoji') }}
      </button>
    </form>
    <release-radar-token-of-the-day />
    <release-radar-live-updates />
    <release-radar-page-section
      :is-loading="isLoadingPersonalList"
      :items="personalList"
      :title="$t('radar.lblPersonalLists')"
    />
    <release-radar-page-section
      :is-loading="isLoadingCuratedList"
      :items="curatedList"
      :title="$t('radar.lblCuratedLists')"
    />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { ContentWrapper } from '@/components/layout';
import {
  ReleaseRadarTokenOfTheDay,
  ReleaseRadarLiveUpdates
} from '@/components/release-radar';
import { ReleaseRadarPageSection } from '@/components/release-radar/release-radar-page-section';

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
