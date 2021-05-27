<template>
  <content-wrapper
    has-back-button
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <nibble-shop-product-overview :id="id" />
    </template>

    <secondary-page :title="id">
      <h2>
        {{ $t('nibbleShop.lblAssetActions.redeem', { title: product.title }) }}
      </h2>
      <nibble-shop-redeem-form :id="id" />
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { ContentWrapper, SecondaryPage } from '@/components/layout';
import { NibbleShopProductOverview } from '@/components/nibble-shop';
import { NibbleShopRedeemForm } from '@/components/forms';
import { Asset } from '@/store/modules/shop/types';

export default Vue.extend({
  name: 'NibbleShopRedeem',
  components: {
    ContentWrapper,
    SecondaryPage,
    NibbleShopProductOverview,
    NibbleShopRedeemForm
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
    id(): string {
      return this.$route.params.id;
    },
    product(): Asset | null {
      return (
        (this.products as Array<Asset>).find(
          (asset: Asset) => asset.id === this.id
        ) || null
      );
    }
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
