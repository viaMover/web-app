<template>
  <left-rail-section
    :section-name="$t('nibbleShop.lblAssetOverview', { name: item.page.title })"
  >
    <left-rail-section-item
      :description="$t('nibbleShop.lblTotalTrades')"
      :value="item.totalTrades"
    />
    <left-rail-section-item
      :description="$t('nibbleShop.lblQuantity.initial')"
      :value="item.initialQuantity"
    />
    <left-rail-section-item
      :description="$t('nibbleShop.lblQuantity.redeemed')"
      :value="item.redeemedQuantity"
    />
    <left-rail-section-item
      :description="$t('nibbleShop.lblQuantity.remaining')"
      :value="item.remainingQuantity"
    />
    <left-rail-section-item
      :description="$t('nibbleShop.lblQuantity.available')"
      :value="item.availableQuantity"
    />
    <left-rail-section-item
      :description="$t('nibbleShop.lblCurrentPrice')"
      :value="item.price"
    />
  </left-rail-section>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { LeftRailSection, LeftRailSectionItem } from '@/components/layout';

import { Asset } from '@/store/modules/shop/types';

export default Vue.extend({
  name: 'NibbleShopProductOverview',
  components: {
    LeftRailSection,
    LeftRailSectionItem
  },
  props: {
    item: {
      type: Object as PropType<Asset>,
      required: true
    }
  }
});
</script>
