<template>
  <navigation-section
    items-container-tag="div"
    :section-name="$t('governance.lblManageGovernance')"
  >
    <template v-if="isLoading">
      <navigation-section-item-image-skeleton v-for="idx in 2" :key="idx" />
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
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import {
  NavigationSection,
  NavigationSectionItemImage,
  NavigationSectionItemImageSkeleton
} from '@/components/navigation';

export default Vue.extend({
  name: 'GovernanceNavManageGovernance',
  components: {
    NavigationSection,
    NavigationSectionItemImage,
    NavigationSectionItemImageSkeleton,
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
