<template>
  <left-rail-section>
    <left-rail-section-nav-item-emoji
      emoji="📦"
      navigate-to="nibble-shop-redeem"
      :text="$t('nibbleShop.lblRedeem')"
    />
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';

import LeftRailSection from '@/components/layout/left-rail/left-rail-section.vue';
import LeftRailSectionNavItemEmoji from '@/components/layout/left-rail/left-rail-section-nav-item-emoji.vue';

export default Vue.extend({
  name: 'NibbleShopRedeemLeftRail',
  components: {
    LeftRailSectionNavItemEmoji,
    LeftRailSection
  }
});
</script>
