<template>
  <nav class="left-rail navigation">
    <div class="wrapper">
      <div class="list">
        <navigation-section :section-name="$t('governance.lblMyGovernance')">
          <template v-if="isLoading">
            <navigation-section-item-image-skeleton />
          </template>
          <template v-else>
            <navigation-section-item-image
              :description="governancePower"
              description-class="bold emphasize"
              navigate-to="governance-view-all"
              :title="$t('governance.lblGovernance')"
              title-class="medium muted"
            >
              <template v-slot:picture>
                <custom-picture
                  :alt="picture.alt"
                  :sources="picture.sources"
                  :src="picture.src"
                />
              </template>
            </navigation-section-item-image>
          </template>
        </navigation-section>

        <navigation-section
          :section-name="$t('governance.lblManageGovernance')"
        >
          <template v-if="isLoading">
            <navigation-section-item-image-skeleton
              v-for="idx in 2"
              :key="idx"
            />
          </template>
          <template v-else>
            <navigation-section-item-image
              v-if="hasEnoughVotingPowerToBecomeAProposer"
              :description="$t('governance.txtCreateAProposal')"
              navigate-to="governance-create"
              :title="$t('governance.lblCreateAProposal')"
            >
              <template v-slot:picture>
                <custom-picture
                  :alt="createPicture.alt"
                  :sources="createPicture.sources"
                  :src="createPicture.src"
                />
              </template>
            </navigation-section-item-image>
            <navigation-section-item-image
              :description="$t('governance.txtGlobalAnalytics')"
              navigate-to="governance-global-analytics"
              :title="$t('governance.lblGlobalAnalytics')"
            >
              <template v-slot:picture>
                <custom-picture
                  :alt="$t('governance.txtGovernanceGlobalAnalyticsImageAlt')"
                  :sources="globalAnalyticsPicture.sources"
                  :src="globalAnalyticsPicture.src"
                />
              </template>
            </navigation-section-item-image>
          </template>
        </navigation-section>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { formatToDecimals } from '@/utils/format';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import {
  NavigationSection,
  NavigationSectionItemImage,
  NavigationSectionItemImageSkeleton
} from '@/components/navigation';

export default Vue.extend({
  name: 'GovernanceLeftRail',
  components: {
    NavigationSection,
    NavigationSectionItemImage,
    NavigationSectionItemImageSkeleton,
    CustomPicture
  },
  data() {
    return {
      picture: {
        src: 'https://storage.googleapis.com/mover-webapp-assets/images/governance.png',
        alt: this.$t('governance.txtGovernanceImageAlt') as string,
        sources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/governance@2x.png',
            variant: '2x'
          }
        ]
      } as PictureDescriptor,
      createPicture: {
        src: 'https://storage.googleapis.com/mover-webapp-assets/images/governance.png',
        alt: this.$t('governance.txtCreateAProposalAlt') as string,
        sources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/governance@2x.png',
            variant: '2x'
          }
        ]
      } as PictureDescriptor,
      globalAnalyticsPicture: {
        src: 'https://storage.googleapis.com/mover-webapp-assets/images/governance-global-analytics.png',
        alt: this.$t(
          'governance.txtGovernanceGlobalAnalyticsImageAlt'
        ) as string,
        sources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/governance-global-analytics@2x.png',
            variant: '2x'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapGetters('governance', {
      isLoading: 'isLoading',
      votingPowerSelf: 'votingPowerSelf'
    }),
    ...mapGetters('governance', {
      hasEnoughVotingPowerToBecomeAProposer:
        'hasEnoughVotingPowerToBecomeAProposer'
    }),
    governancePower(): string {
      return `${formatToDecimals(this.votingPowerSelf, 0)} Power`;
    }
  }
});
</script>
