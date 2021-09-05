<template>
  <left-rail-section
    items-container-tag="div"
    :section-name="$t('governance.lblManageGovernance')"
  >
    <left-rail-section-nav-item-image
      :description="$t('governance.txtCreateAProposal')"
      navigate-to-name="governance-create"
      :title="$t('governance.lblCreateAProposal')"
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
      navigate-to-name="governance-global-analytics"
      :title="$t('governance.lblGlobalAnalytics')"
    >
      <template v-slot:picture>
        <custom-picture
          :alt="$t('governance.txtGovernanceGlobalAnalyticsImageAlt')"
          :sources="globalAnalyticsPicture.sources"
          :src="globalAnalyticsPicture.src"
        />
      </template>
    </left-rail-section-nav-item-image>
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';

import {
  LeftRailSection,
  LeftRailSectionNavItemImage
} from '@/components/layout';
import { CustomPicture, PictureDescriptor } from '@/components/html5';

export default Vue.extend({
  name: 'GovernanceNavManageGovernance',
  components: {
    LeftRailSection,
    LeftRailSectionNavItemImage,
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
  }
});
</script>
