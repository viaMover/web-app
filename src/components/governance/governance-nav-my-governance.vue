<template>
  <navigation-section
    items-container-tag="div"
    :section-name="$t('governance.lblMyGovernance')"
  >
    <template v-if="isLoading">
      <navigation-section-item-image-skeleton />
    </template>
    <template v-else>
      <navigation-section-item-image
        :description="governancePower"
        description-class="bold"
        navigate-to="governance-view-all"
        :title="$t('governance.lblGovernance')"
        title-class="medium disabled"
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
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { formatToDecimals } from '@/utils/format';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import {
  NavigationSection,
  NavigationSectionItemImage,
  NavigationSectionItemImageSkeleton
} from '@/components/navigation';

export default Vue.extend({
  name: 'GovernanceNavMyGovernance',
  components: {
    NavigationSection,
    NavigationSectionItemImage,
    NavigationSectionItemImageSkeleton,
    CustomPicture
  },
  data() {
    return {
      picture: {
        src: require('@/assets/images/governance.png'),
        alt: this.$t('governance.txtGovernanceImageAlt') as string,
        sources: [
          {
            src: require('@/assets/images/governance@2x.png'),
            variant: '2x'
          }
        ]
      } as PictureDescriptor
    };
  },
  computed: {
    ...mapState('governance', {
      isLoading: 'isLoading',
      votingPowerSelf: 'votingPowerSelf'
    }),
    governancePower(): string {
      return `${formatToDecimals(this.votingPowerSelf, 0)} Power`;
    }
  }
});
</script>
