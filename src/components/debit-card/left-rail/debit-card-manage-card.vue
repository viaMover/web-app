<template>
  <left-rail-section
    items-container-tag="div"
    :section-name="$t('debitCard.lblManageCard')"
  >
    <template v-if="isLoading">
      <left-rail-section-nav-item-image-skeleton v-for="idx in 2" :key="idx" />
    </template>
    <template v-else>
      <left-rail-section-nav-item-image
        :description="$t('debitCard.txtCardTopUp')"
        navigate-to="debit-card-top-up"
        :title="$t('debitCard.lblCardTopUp')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="topUpPicture.alt"
            :sources="topUpPicture.sources"
            :src="topUpPicture.src"
          />
        </template>
      </left-rail-section-nav-item-image>
      <left-rail-section-nav-item-image
        :description="$t('debitCard.txtChangeSkin')"
        navigate-to="debit-card-change-skin"
        :title="$t('debitCard.lblChangeSkin')"
      >
        <template v-slot:picture>
          <custom-picture
            :alt="changeSkinPicture.alt"
            :sources="changeSkinPicture.sources"
            :src="changeSkinPicture.src"
          />
        </template>
      </left-rail-section-nav-item-image>
    </template>
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';

import {
  LeftRailSection,
  LeftRailSectionNavItemImage,
  LeftRailSectionNavItemImageSkeleton
} from '@/components/layout';

export default Vue.extend({
  name: 'DebitCardManageCard',
  components: {
    LeftRailSection,
    LeftRailSectionNavItemImage,
    LeftRailSectionNavItemImageSkeleton
  }
});
</script>
