<template>
  <left-rail-section items-container-class="progressive-left-rail">
    <left-rail-section :section-name="$t('treasury.lblMySmartTreasury')">
      <left-rail-section-nav-item-image
        :description="0"
        description-class="bold"
        navigate-to="treasury-manage"
        :title="$t('treasury.lblSmartTreasury')"
        title-class="disabled medium"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="st.alt"
            :sources="st.sources"
            :src="st.src"
            :webp-sources="st.webpSources"
          />
        </template>
      </left-rail-section-nav-item-image>
    </left-rail-section>
    <left-rail-section
      :section-name="$t('treasury.leftRail.lblManageSmartTreasury')"
    >
      <left-rail-section-nav-item-image
        :description="$t('treasury.leftRail.lblIncreaseBoostDescription')"
        navigate-to="treasury-increase"
        :title="$t('treasury.leftRail.lblIncreaseBoost')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="increase.alt"
            :sources="increase.sources"
            :src="increase.src"
            :webp-sources="increase.webpSources"
          />
        </template>
      </left-rail-section-nav-item-image>
      <left-rail-section-nav-item-image
        :description="$t('treasury.leftRail.lblDecreaseBoostDescription')"
        navigate-to="treasury-decrease"
        :title="$t('treasury.leftRail.lblDecreaseBoost')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="decrease.alt"
            :sources="decrease.sources"
            :src="decrease.src"
            :webp-sources="decrease.webpSources"
          />
        </template>
      </left-rail-section-nav-item-image>
      <left-rail-section-nav-item-image
        :description="$t('treasury.leftRail.lblClaimAndBurnDescription')"
        navigate-to="treasury-claim-and-burn"
        :title="$t('treasury.leftRail.lblClaimAndBurn')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="claimAndBurn.alt"
            :sources="claimAndBurn.sources"
            :src="claimAndBurn.src"
            :webp-sources="claimAndBurn.webpSources"
          />
        </template>
      </left-rail-section-nav-item-image>
      <left-rail-section-nav-item-image
        :description="$t('treasury.leftRail.lblPowerCardDescription')"
        navigate-to="treasury-powercard"
        :title="$t('treasury.leftRail.lblPowerCard')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="powercard.alt"
            :sources="powercard.sources"
            :src="powercard.src"
            :webp-sources="powercard.webpSources"
          />
        </template>
      </left-rail-section-nav-item-image>
      <left-rail-section-nav-item-image
        :description="$t('treasury.leftRail.lblGlobalAnalyticsDescription')"
        navigate-to="treasury-global-analytics"
        :title="$t('treasury.leftRail.lblGlobalAnalytics')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="analytics.alt"
            :sources="analytics.sources"
            :src="analytics.src"
            :webp-sources="analytics.webpSources"
          />
        </template>
      </left-rail-section-nav-item-image>
    </left-rail-section>
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';

import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';
import {
  LeftRailSection,
  LeftRailSectionNavItemImage
} from '@/components/layout';

export default Vue.extend({
  name: 'TreasuryLeftRail',
  components: {
    CustomPicture,
    LeftRailSectionNavItemImage,
    LeftRailSection
  },
  data() {
    return {
      st: {
        alt: this.$t('treasury.lblSmartTreasury'),
        src: require('@/assets/images/SmartTreasury@1x.png'),
        sources: [
          { src: require('@/assets/images/SmartTreasury@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/SmartTreasury@2x.png')
          }
        ],
        webpSources: [
          { src: require('@/assets/images/SmartTreasury@1x.webp') },
          {
            variant: '2x',
            src: require('@/assets/images/SmartTreasury@2x.webp')
          }
        ]
      } as PictureDescriptor,
      powercard: {
        alt: '',
        src: require('@/assets/images/Powercard_icon@1x.png'),
        sources: [
          { src: require('@/assets/images/Powercard_icon@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Powercard_icon@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor,
      increase: {
        alt: '',
        src: require('@/assets/images/IncreaseBoost@1x.png'),
        sources: [
          { src: require('@/assets/images/IncreaseBoost@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/IncreaseBoost@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor,
      decrease: {
        alt: '',
        src: require('@/assets/images/DecreaseBoost@1x.png'),
        sources: [
          { src: require('@/assets/images/DecreaseBoost@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/DecreaseBoost@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor,
      claimAndBurn: {
        alt: '',
        src: require('@/assets/images/Claim&Burn@1x.png'),
        sources: [
          { src: require('@/assets/images/Claim&Burn@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/Claim&Burn@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor,
      analytics: {
        alt: '',
        src: require('@/assets/images/GlobalAnalytics@1x.png'),
        sources: [
          { src: require('@/assets/images/GlobalAnalytics@1x.png') },
          {
            variant: '2x',
            src: require('@/assets/images/GlobalAnalytics@2x.png')
          }
        ],
        webpSources: []
      } as PictureDescriptor
    };
  },
  computed: {}
});
</script>
