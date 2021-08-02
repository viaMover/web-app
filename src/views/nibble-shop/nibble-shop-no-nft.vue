<template>
  <content-wrapper
    base-class="nibble-shop"
    has-close-button
    page-container-class="nibble-shop__wrapper"
    wrapper-class="nibble-shop__wrapper"
    @close="handleClose"
  >
    <div class="nibble-shop__wrapper-info-title">
      <img
        :alt="$t('nibbleShop.txtLogoAlt')"
        src="@/assets/images/nibble-shop.png"
      />
    </div>
    <div class="nibble-shop__wrapper-info-items">
      <h1>{{ $t('nibbleShop.lblNoNFT') }}</h1>
      <div>
        {{ $t('nibbleShop.txtNoNFT') }}
      </div>
    </div>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper } from '@/components/layout';

export default Vue.extend({
  name: 'NibbleShopNoNft',
  components: {
    ContentWrapper
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
