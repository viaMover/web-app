<template>
  <content-wrapper
    has-close-button
    has-left-rail
    is-black-close-button
    left-rail-inner-wrapper-class="page-sidebar-wrapper"
    wrapper-class="redeem"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <keep-alive>
        <component :is="'nibble-shop-redeem-left-rail'" />
      </keep-alive>
    </template>

    <secondary-page has-back-button @back="handleBack">
      <secondary-page-simple-title
        class="page-title"
        :description="$t('nibbleShop.txtRedeemDescription')"
        :title="$t('nibbleShop.lblRedeemAnItem')"
      />

      <statement-list>
        <statement-list-item
          :description="$t('nibbleShop.lblRedeem')"
          :value="product ? product.title : ''"
        />
        <statement-list-item :description="$t('nibbleShop.lblYourEmail')">
          <input />
        </statement-list-item>
        <statement-list-item :description="$t('nibbleShop.lblYourName')">
          <input />
        </statement-list-item>
        <statement-list-item :description="$t('nibbleShop.lblCountry')">
          <input />
        </statement-list-item>
        <statement-list-item :description="$t('nibbleShop.lblDeliveryAddress')">
          <input />
        </statement-list-item>
        <statement-list-item :description="$t('nibbleShop.lblPostalCode')">
          <input />
        </statement-list-item>
      </statement-list>
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { Asset } from '@/store/modules/shop/types';

import {
  SecondaryPage,
  SecondaryPageSimpleTitle
} from '@/components/layout/secondary-page';
import { NibbleShopRedeemLeftRail } from '@/components/nibble-shop';
import {
  StatementList,
  StatementListItem
} from '@/components/statements/statement-list';
import ContentWrapper from '@/components/layout/content-wrapper.vue';

export default Vue.extend({
  name: 'NibbleShopRedeem',
  components: {
    StatementListItem,
    StatementList,
    SecondaryPageSimpleTitle,
    SecondaryPage,
    ContentWrapper,
    NibbleShopRedeemLeftRail
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
    handleBack(): void {
      this.$router.back();
    },
    handleClose(): void {
      this.$router.push({ name: 'home' });
    }
  }
});
</script>
