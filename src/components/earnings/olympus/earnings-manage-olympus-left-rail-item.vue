<template>
  <navigation-section :section-name="$t('earnings.olympus.lblManage')">
    <template v-if="isLoading">
      <navigation-section-item-image-skeleton v-for="idx in 2" :key="idx" />
    </template>
    <template v-else>
      <navigation-section-item-image
        :description="$t('earnings.olympus.txtStake', { apy })"
        navigate-to="earnings-olympus-stake"
        :title="$t('earnings.olympus.lblStake')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="stakePicture.alt"
            :sources="stakePicture.sources"
            :src="stakePicture.src"
          />
        </template>
      </navigation-section-item-image>
      <navigation-section-item-image
        v-if="hasActiveEarnings"
        :description="$t('earnings.olympus.txtWithdraw')"
        navigate-to="earnings-olympus-withdraw"
        :title="$t('earnings.olympus.lblWithdraw')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="withdrawPicture.alt"
            :sources="withdrawPicture.sources"
            :src="withdrawPicture.src"
          />
        </template>
      </navigation-section-item-image>
      <navigation-section-item-image
        :description="$t('earnings.olympus.txtGlobalAnalytics')"
        navigate-to="earnings-olympus-global-analytics"
        :title="$t('earnings.olympus.lblGlobalAnalytics')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="globalAnalyticsPicture.alt"
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

import { formatPercents } from '@/utils/format';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import {
  NavigationSection,
  NavigationSectionItemImage,
  NavigationSectionItemImageSkeleton
} from '@/components/navigation';

export default Vue.extend({
  name: 'EarningsManageOlympusLeftRailItem',
  components: {
    NavigationSection,
    NavigationSectionItemImage,
    NavigationSectionItemImageSkeleton,
    CustomPicture
  },
  data() {
    return {
      stakePicture: {
        src: require('@/assets/images/earnings-stake.png'),
        alt: this.$t('earnings.olympus.txtStakePictureAlt') as string,
        sources: [
          {
            src: require('@/assets/images/earnings-stake@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor,
      withdrawPicture: {
        src: require('@/assets/images/earnings-withdraw.png'),
        alt: this.$t('earnings.olympus.txtWithdrawPictureAlt') as string,
        sources: [
          {
            src: require('@/assets/images/earnings-withdraw@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor,
      globalAnalyticsPicture: {
        src: require('@/assets/images/earnings-global-analytics.png'),
        alt: this.$t('earnings.olympus.txtGlobalAnalyticsPictureAlt') as string,
        sources: [
          {
            src: require('@/assets/images/earnings-global-analytics@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('earnings/olympus', {
      olympusAPY: 'olympusAPY',
      isLoading: 'isLoading'
    }),
    ...mapGetters('earnings/olympus', {
      hasActiveEarnings: 'hasActiveEarnings'
    }),
    apy(): string {
      return `${formatPercents(this.olympusAPY)}%`;
    }
  }
});
</script>
