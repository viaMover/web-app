<template>
  <content-wrapper
    v-if="asset"
    has-back-button
    has-close-button
    has-left-rail
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <nft-overview :id="id" />
    </template>

    <secondary-page :has-heading-buttons="hasHeadingButtons" :title="id">
      <template v-slot:heading-buttons>
        <action-button @button-click="handleExecuteClaimAndExchange">
          {{ $t('NFTs.btnClaimAndExchange.emoji') }}
        </action-button>
        <action-button @button-click="handleExecuteExchange">
          {{ $t('NFTs.btnExchange.emoji') }}
        </action-button>
        <action-button @button-click="handleExecuteClaim">
          {{ $t('NFTs.btnClaim.emoji') }}
        </action-button>
      </template>
      <h2>{{ asset.name }}</h2>
      <img
        :alt="$t('NFTs.txtAssetAlt', { name: asset.name })"
        class="image"
        :src="asset.imageSrc"
      />
      <div class="description">{{ asset.description }}</div>
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper, SecondaryPage } from '@/components/layout';
import { NftOverview } from '@/components/nft';
import { ActionButton } from '@/components/buttons';
import { mapGetters } from 'vuex';
import { NFT } from '@/store/modules/nft/types';

export default Vue.extend({
  name: 'NftView',
  components: {
    ContentWrapper,
    SecondaryPage,
    NftOverview,
    ActionButton
  },
  computed: {
    ...mapGetters('nft', { assets: 'plainNFTs' }),
    id(): string {
      return this.$route.params.id;
    },
    hasHeadingButtons(): boolean {
      return true;
    },
    asset(): NFT | null {
      return (
        (this.assets as Array<NFT>).find(
          (asset: NFT) => asset.id === this.id
        ) || null
      );
    }
  },
  methods: {
    handleExecuteClaimAndExchange(): void {
      //
    },
    handleExecuteExchange(): void {
      //
    },
    handleExecuteClaim(): void {
      //
    },
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
