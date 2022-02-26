<template>
  <content-wrapper-two-sided
    class="shop nft-drops view swap-passport"
    has-close-button
    @close="handleClose"
  >
    <template v-slot:left>
      <div class="page-header">
        <h1 class="title">{{ $t('NFTs.lblSwapPassport') }}</h1>
        <div class="description">
          {{ $t(`NFTs.txtNFTs.${nft.id}.pageDescription`) }}
        </div>
      </div>
    </template>

    <template v-slot:right></template>

    <template v-slot:modals></template>
  </content-wrapper-two-sided>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { NftAssetId } from '@/store/modules/nft/types';
import { GasListenerMixin } from '@/utils/gas-listener-mixin';

import { ContentWrapperTwoSided } from '@/components/layout';

export default Vue.extend({
  name: 'NftViewSwapPassport',
  components: {
    ContentWrapperTwoSided
  },
  mixins: [GasListenerMixin],
  data() {
    return {
      NftAssetId
    };
  },
  computed: {
    ...mapState('nft', {
      nft: 'swapPassport'
    })
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
