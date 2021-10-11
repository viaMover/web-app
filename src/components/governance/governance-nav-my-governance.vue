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

import { formatToNative } from '@/utils/format';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import {
  LeftRailSection,
  LeftRailSectionNavItemImage
} from '@/components/layout';

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
    governancePower(): string {
      return `${formatToNative('123190.24')} Power`;
    }
  }
});
</script>
