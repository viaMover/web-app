<template>
  <content-wrapper
    base-class="release-radar-desktop"
    has-back-button
    wrapper-class="release-radar-desktop"
    @close="handleClose"
  >
    <form
      class="search-form"
      @click.capture.stop.prevent="handleOpenSelectModal"
    >
      <input
        :name="$t('search.lblSearch')"
        :placeholder="$t('search.lblSearchBarPlaceholder')"
        readonly
        type="search"
      />
      <button class="button-active" type="submit">
        {{ $t('radar.btnSearch.emoji') }}
      </button>
    </form>
    <release-radar-token-of-the-day />
    <release-radar-live-updates />
    <release-radar-swipe-section
      :is-loading="isLoadingPersonalList"
      :items="personalList"
      :title="$t('radar.lblPersonalLists')"
    />
    <release-radar-swipe-section
      :is-loading="isLoadingCuratedList"
      :items="curatedList"
      :title="$t('radar.lblCuratedLists')"
    />
    <search-modal />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { ContentWrapper } from '@/components/layout';
import {
  ReleaseRadarSwipeSection,
  ReleaseRadarTokenOfTheDay,
  ReleaseRadarLiveUpdates
} from '@/components/release-radar';
import { toggleThenWaitForResult } from '@/components/toggle/toggle-root';
import { Modal } from '@/components/modals';
import SearchModal from '@/components/modals/search-modal/search-modal.vue';
import { TokenWithBalance } from '@/wallet/types';

export default Vue.extend({
  name: 'ReleaseRadarViewAll',
  components: {
    SearchModal,
    ReleaseRadarSwipeSection,
    ContentWrapper,
    ReleaseRadarTokenOfTheDay,
    ReleaseRadarLiveUpdates
  },
  computed: {
    ...mapGetters('radar', ['personalList', 'curatedList']),
    ...mapState('radar', ['isLoadingCuratedList', 'isLoadingPersonalList'])
  },
  methods: {
    handleClose(): void {
      this.$router.push({
        name: 'home'
      });
    },
    handleSearchResult(): void {
      //TODO replace this after create details page
      // this.$router.push({ name: '<page>', props: { id: assetId }})
    },
    handleOpenSelectModal(): void {
      toggleThenWaitForResult(Modal.SearchToken, this.handleSearchResult, {});
    }
  }
});
</script>
