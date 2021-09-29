<template>
  <left-rail-section>
    <left-rail-section :section-name="$t('vaultsRace.lblMyVaults')">
      <left-rail-section-nav-item-image
        :description="vaultsDescription"
        description-class="bold"
        navigate-to="vaults-race-view-all"
        :title="$t('vaultsRace.lblVaults')"
        title-class="disabled"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="race.alt"
            :sources="race.sources"
            :src="race.src"
            :webp-sources="race.webpSources"
          />
        </template>
      </left-rail-section-nav-item-image>
    </left-rail-section>
    <left-rail-section :section-name="$t('vaultsRace.lblManageVaults')">
      <left-rail-section-nav-item-image
        :description="$t('vaultsRace.lblGlobalStatistics')"
        description-class="disabled"
        navigate-to="vaults-race-statistics"
        :title="$t('vaultsRace.lblLeaderboard')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="leaderboard.alt"
            :sources="leaderboard.sources"
            :src="leaderboard.src"
            :webp-sources="leaderboard.webpSources"
          />
        </template>
      </left-rail-section-nav-item-image>
    </left-rail-section>
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import {
  LeftRailSection,
  LeftRailSectionNavItemImage
} from '@/components/layout';
import { CustomPicture, PictureDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'VaultsRaceLeftRail',
  components: {
    LeftRailSection,
    LeftRailSectionNavItemImage,
    CustomPicture
  },
  data() {
    return {
      //TODO insert new image
      race: {
        alt: '',
        src: require('@/assets/images/Savings@1x.png'),
        sources: [
          { src: require('@/assets/images/Savings@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Savings@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/Savings@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/Savings@2x.webp')
          }
        ]
      } as PictureDescriptor,
      leaderboard: {
        alt: '',
        src: require('@/assets/images/Savings@1x.png'),
        sources: [
          { src: require('@/assets/images/Savings@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Savings@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/Savings@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/Savings@2x.webp')
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapGetters('games', {
      vaultsRaceAccountsCount: 'vaultsRaceAccountsCount'
    }),
    vaultsDescription(): string {
      return `${this.vaultsRaceAccountsCount} accounts`;
    }
  }
});
</script>
