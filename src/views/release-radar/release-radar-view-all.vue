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
import { mapActions, mapGetters, mapState } from 'vuex';

import { Token } from '@/wallet/types';
import { Modal as ModalType } from '@/store/modules/modals/types';

import { ContentWrapper } from '@/components/layout';
import {
  ReleaseRadarSwipeSection,
  ReleaseRadarTokenOfTheDay,
  ReleaseRadarLiveUpdates
} from '@/components/release-radar';
import SearchModal from '@/components/modals/search-modal/search-modal.vue';

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
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
    handleClose(): void {
      this.$router.push({
        name: 'home'
      });
    },
    async handleOpenSelectModal(): Promise<void> {
      const selectedAsset: Token | undefined = await this.setIsModalDisplayed({
        id: ModalType.SearchToken,
        value: true
      });
      if (selectedAsset !== undefined) {
        await this.$router.push({
          name: 'asset-view',
          params: { id: selectedAsset.address }
        });
      }
    }
  }
});
</script>
