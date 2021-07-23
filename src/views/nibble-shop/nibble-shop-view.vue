<template>
  <content-wrapper
    has-back-button
    has-left-rail
    page-container-class="nibble-shop-product-item"
    wrapper-class="nibble-shop-product-item"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <nibble-shop-product-overview :item="product" />
    </template>

    <secondary-page>
      <template v-slot:title>
        <secondary-page-title
          :icon-img-src="product.page.iconSrc"
          :title="$t('nibbleShop.lblNibbleShop')"
          wrapper-class="nibble-shop-product-item-wrapper-title"
        >
          <template v-if="hasContextMenu" v-slot:context-menu>
            <context-button :popover-parent-id="popoverParentId">
              <context-button-item
                :text="$t('nibbleShop.btnBuy.emoji')"
                @click="handleBuy"
              />
              <context-button-item
                :text="$t('nibbleShop.btnSell.emoji')"
                @click="handleSell"
              />
              <context-button-item
                :text="$t('nibbleShop.btnRedeem.emoji')"
                @click="handleRedeem"
              />
            </context-button>
          </template>
        </secondary-page-title>
      </template>
      <div class="nibble-shop-product-item-wrapper-banner">
        <video
          :alt="$t('nibbleShop.txtProductAlt', { title: product.title })"
          autoplay
          data-keepplaying
          loop
          muted
          :src="product.page.videoSrc"
        />
      </div>
      <div class="nibble-shop-product-item-wrapper-info">
        <span>{{ product.id }}</span>
        <h3>{{ product.page.title }}</h3>
        <span class="price">{{ product.price }}</span>
        <p>{{ product.description }}</p>
      </div>
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { Asset } from '@/store/modules/shop/types';

import {
  ContentWrapper,
  SecondaryPage,
  SecondaryPageTitle
} from '@/components/layout';
import { NibbleShopProductOverview } from '@/components/nibble-shop';
import { ContextButton, ContextButtonItem } from '@/components/buttons';

export default Vue.extend({
  name: 'NibbleShopView',
  components: {
    ContentWrapper,
    NibbleShopProductOverview,
    SecondaryPage,
    ContextButton,
    ContextButtonItem,
    SecondaryPageTitle
  },
  data() {
    return {
      popoverParentId: 'nibble-shop-action-buttons'
    };
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
    id(): string {
      return this.$route.params.id;
    },
    hasContextMenu(): boolean {
      return true;
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
    },
    handleBuy(): void {
      //
    },
    handleSell(): void {
      //
    },
    handleRedeem(): void {
      //
    }
  }
});
</script>
