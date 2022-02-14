<template>
  <navigation-section :section-name="$t('earnings.ethereum.lblManage')">
    <template v-if="isLoading">
      <navigation-section-item-image-skeleton v-for="idx in 2" :key="idx" />
    </template>
    <template v-else>
      <navigation-section-item-image
        :description="$t('earnings.ethereum.txtStake', { apy })"
        navigate-to="earnings-ethereum-stake"
        :title="$t('earnings.ethereum.lblStake')"
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
        :description="$t('earnings.ethereum.txtGlobalAnalytics')"
        navigate-to="earnings-ethereum-global-analytics"
        :title="$t('earnings.ethereum.lblGlobalAnalytics')"
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
  name: 'EarningsManageEthereumLeftRailItem',
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
        alt: this.$t('earnings.ethereum.txtStakePictureAlt') as string,
        sources: [
          {
            src: require('@/assets/images/earnings-stake@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor,
      withdrawPicture: {
        src: require('@/assets/images/earnings-withdraw.png'),
        alt: this.$t('earnings.ethereum.txtWithdrawPictureAlt') as string,
        sources: [
          {
            src: require('@/assets/images/earnings-withdraw@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor,
      globalAnalyticsPicture: {
        src: require('@/assets/images/earnings-global-analytics.png'),
        alt: this.$t(
          'earnings.ethereum.txtGlobalAnalyticsPictureAlt'
        ) as string,
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
    ...mapState('earnings/ethereum', {
      ethereumAPY: 'ethereumAPY',
      isLoading: 'isLoading'
    }),
    ...mapGetters('earnings/ethereum', {
      hasActiveEarnings: 'hasActiveEarnings'
    }),
    apy(): string {
      return `${formatPercents(this.ethereumAPY)}%`;
    }
  }
});
</script>
