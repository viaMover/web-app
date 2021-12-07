<template>
  <left-rail-section
    items-container-tag="div"
    :section-name="$t('debitCard.lblMyCard')"
  >
    <template v-if="isLoading">
      <left-rail-section-nav-item-image-skeleton />
    </template>
    <template v-else>
      <left-rail-section-nav-item-image
        :description="cardStateText"
        :description-class="descriptionClass"
        navigate-to="debit-card-manage"
        :title="$t('debitCard.lblBeautifulCard')"
        title-class="medium disabled"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="currentSkinPicture.alt"
            :sources="currentSkinPicture.sources"
            :src="currentSkinPicture.src"
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
  name: 'DebitCardMyCard',
  components: {
    LeftRailSection,
    LeftRailSectionNavItemImage,
    LeftRailSectionNavItemImageSkeleton,
    CustomPicture
  },
  computed: {
    ...mapState('debitCard', {
      isLoading: 'isLoading',
      cardState: 'cardState'
    }),
    ...mapGetters('debitCard', {
      cardStateText: 'cardStateText',
      currentSkin: 'currentSkin'
    }),
    currentSkinPicture(): PictureDescriptor {
      return this.currentSkin.previewPicture;
    },
    descriptionClass(): string {
      if (['frozen', 'expired'].includes(this.cardState)) {
        return 'bold error';
      }

      return 'bold';
    }
  }
});
</script>
