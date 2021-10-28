<template>
  <left-rail-section
    items-container-tag="div"
    :section-name="$t('debitCard.lblManageCard')"
  >
    <template v-if="isLoading">
      <left-rail-section-nav-item-image-skeleton />
    </template>
    <template v-else>
      <left-rail-section-nav-item-image
        :description="cardState"
        navigate-to="debit-card-top-up"
        :title="$t('debitCard.lblBeautifulCard')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="skinPicture.alt"
            :sources="skinPicture.sources"
            :src="skinPicture.src"
          />
        </template>
      </left-rail-section-nav-item-image>
    </template>
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

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
    LeftRailSectionNavItemImageSkeleton
  },
  computed: {
    ...mapGetters('debitCard', {
      cardState: 'cardStateText',
      skinPicture: 'skinPicture'
    })
  }
});
</script>
