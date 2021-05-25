<template>
  <content-wrapper has-close-button @close="handleClose">
    <div class="image">
      <img
        :alt="$t('nibbleShop.txtLogoAlt')"
        src="/src/assets/nibble-shop.png"
      />
    </div>
    <div class="container container-text">
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
