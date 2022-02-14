<template>
  <content-wrapper
    class="vaults-race"
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <navigation-section :section-name="$t('vaultsRace.lblMyVaults')">
        <navigation-section-item-image
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
        </navigation-section-item-image>
      </navigation-section>
      <navigation-section :section-name="$t('vaultsRace.lblManageVaults')">
        <navigation-section-item-image
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
        </navigation-section-item-image>
      </navigation-section>
    </template>

    <transition mode="out-in" name="fade">
      <router-view />
    </transition>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { ContentWrapper } from '@/components/layout';
import {
  NavigationSection,
  NavigationSectionItemImage
} from '@/components/navigation';

export default Vue.extend({
  name: 'VaultsRaceRoot',
  components: {
    ContentWrapper,
    NavigationSection,
    NavigationSectionItemImage,
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
  },
  methods: {
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
