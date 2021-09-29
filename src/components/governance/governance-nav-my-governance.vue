<template>
  <left-rail-section
    items-container-tag="div"
    :section-name="$t('governance.lblMyGovernance')"
  >
    <left-rail-section-nav-item-image
      :description="governancePower"
      description-class="bold"
      navigate-to="governance-view-all"
      :title="$t('governance.lblGovernance')"
      title-class="disabled"
    >
      <template v-slot:picture>
        <custom-picture
          :alt="picture.alt"
          :sources="picture.sources"
          :src="picture.src"
        />
      </template>
    </left-rail-section-nav-item-image>
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';

import { formatToDecimals } from '@/utils/format';

import {
  LeftRailSection,
  LeftRailSectionNavItemImage
} from '@/components/layout';
import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { mapState } from 'vuex';

export default Vue.extend({
  name: 'GovernanceNavMyGovernance',
  components: {
    LeftRailSection,
    LeftRailSectionNavItemImage,
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
    ...mapState('proposal', {
      votingPowerSelf: 'votingPowerSelf'
    }),
    governancePower(): string {
      return `${formatToDecimals(this.votingPowerSelf, 0)} Power`;
    }
  }
});
</script>
