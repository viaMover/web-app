<template>
  <left-rail-section
    items-container-tag="div"
    :section-name="$t('governance.lblManageGovernance')"
  >
    <template v-if="isLoading">
      <left-rail-section-nav-item-image-skeleton v-for="idx in 2" :key="idx" />
    </template>
    <template v-else>
      <left-rail-section-nav-item-image
        v-if="hasEnoughVotingPowerToBecomeAProposer"
        :description="$t('governance.txtCreateAProposal')"
        navigate-to="governance-create"
        :title="$t('governance.lblCreateAProposal')"
        title-class="bold"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="createPicture.alt"
            :sources="createPicture.sources"
            :src="createPicture.src"
          />
        </template>
      </left-rail-section-nav-item-image>
      <left-rail-section-nav-item-image
        :description="$t('governance.txtGlobalAnalytics')"
        navigate-to="governance-global-analytics"
        :title="$t('governance.lblGlobalAnalytics')"
        title-class="bold"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="$t('governance.txtGovernanceGlobalAnalyticsImageAlt')"
            :sources="globalAnalyticsPicture.sources"
            :src="globalAnalyticsPicture.src"
          />
        </template>
      </left-rail-section-nav-item-image>
    </template>
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import {
  LeftRailSection,
  LeftRailSectionNavItemImage,
  LeftRailSectionNavItemImageSkeleton
} from '@/components/layout';

export default Vue.extend({
  name: 'GovernanceNavManageGovernance',
  components: {
    LeftRailSection,
    LeftRailSectionNavItemImage,
    LeftRailSectionNavItemImageSkeleton,
    CustomPicture
  },
  data() {
    return {
      createPicture: {
        src: require('@/assets/images/governance.png'),
        alt: this.$t('governance.txtCreateAProposalAlt') as string,
        sources: [
          {
            src: require('@/assets/images/governance@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor,
      globalAnalyticsPicture: {
        src: require('@/assets/images/governance-global-analytics.png'),
        alt: this.$t(
          'governance.txtGovernanceGlobalAnalyticsImageAlt'
        ) as string,
        sources: [
          {
            src: require('@/assets/images/governance-global-analytics@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('governance', {
      isLoading: 'isLoading'
    }),
    ...mapGetters('governance', {
      hasEnoughVotingPowerToBecomeAProposer:
        'hasEnoughVotingPowerToBecomeAProposer'
    })
  }
});
</script>
