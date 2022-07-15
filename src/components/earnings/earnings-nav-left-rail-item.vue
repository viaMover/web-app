<template>
  <navigation-section :section-name="$t('earnings.lblMyEarnings')">
    <template v-if="isLoading">
      <navigation-section-item-image-skeleton v-for="idx in 2" :key="idx" />
    </template>
    <template v-else>
      <navigation-section-item-image
        v-if="isFeatureEnabled('isEarningsEthereumEnabled')"
        :description="earningsEthereumBalance"
        description-class="bold"
        navigate-to="earnings-ethereum-manage"
        :title="$t('earnings.ethereum.lblEthereum')"
        title-class="disabled medium"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="$t('earnings.ethereum.txtNavIconAlt')"
            :sources="navPicture.sources"
            :src="navPicture.src"
          />
        </template>
      </navigation-section-item-image>
      <navigation-section-item-image
        v-if="isFeatureEnabled('isEarningsOlympusEnabled')"
        :description="earningsOlympusBalance"
        description-class="bold"
        navigate-to="earnings-olympus-manage"
        :title="$t('earnings.olympus.lblOlympusDAO')"
        title-class="disabled medium"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="$t('earnings.olympus.txtNavIconAlt')"
            :sources="navPicture.sources"
            :src="navPicture.src"
          />
        </template>
      </navigation-section-item-image>
    </template>
  </navigation-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { isFeatureEnabled } from '@/settings';
import { formatToNative } from '@/utils/format';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import {
  NavigationSection,
  NavigationSectionItemImage,
  NavigationSectionItemImageSkeleton
} from '@/components/navigation';

export default Vue.extend({
  name: 'EarningsNavLeftRailItem',
  components: {
    NavigationSection,
    NavigationSectionItemImage,
    NavigationSectionItemImageSkeleton,
    CustomPicture
  },
  data() {
    return {
      navPicture: {
        src: 'https://storage.googleapis.com/mover-webapp-assets/images/earnings-ethereum-and-olympus@1x.png',
        alt: 'unused' as string,
        sources: [
          {
            src: 'https://storage.googleapis.com/mover-webapp-assets/images/earnings-ethereum-and-olympus@2x.png',
            variant: '2x'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('earnings', {
      isLoading: 'isLoading'
    }),
    ...(isFeatureEnabled('isEarningsEthereumEnabled') &&
      mapGetters('earnings/ethereum', {
        earningsEthereumBalanceNative: 'balanceNative'
      })),
    ...(isFeatureEnabled('isEarningsOlympusEnabled') &&
      mapGetters('earnings/olympus', {
        earningsOlympusBalanceNative: 'balanceNative'
      })),
    earningsEthereumBalance(): string {
      if (this.earningsEthereumBalanceNative === undefined) {
        return '';
      }

      return `$${formatToNative(this.earningsEthereumBalanceNative)}`;
    },
    earningsOlympusBalance(): string {
      if (this.earningsOlympusBalanceNative === undefined) {
        return '';
      }

      return `$${formatToNative(this.earningsOlympusBalanceNative)}`;
    }
  },
  methods: {
    isFeatureEnabled
  }
});
</script>
