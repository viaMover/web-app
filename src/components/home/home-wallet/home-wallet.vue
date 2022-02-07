<template>
  <div class="wallet">
    <div v-if="showEmptyState" class="empty-state">
      {{ $t('lblNewToMover') }}
    </div>
    <div v-else class="list">
      <home-wallet-tokens-wrapper
        v-if="showTokensList"
        :is-loading="isTokensListLoading"
      >
        <template v-slot:header>
          <h2 class="header complex">
            <span>{{ $t('lblTotalBalance') }}</span>
            <span>{{ balanceNative }}</span>
          </h2>
        </template>

        <home-wallet-token-item
          v-for="token in tokens"
          :key="token.address"
          :token="token"
        />
      </home-wallet-tokens-wrapper>

      <home-wallet-collectibles-wrapper
        v-if="showCollectiblesList"
        :is-loading="isCollectiblesListLoading"
      >
        <template v-slot:header>
          <h2 class="header">{{ $t('lblCollectibles') }}</h2>
        </template>

        <nibble-shop-product-mini
          v-for="item in nibbleShopItems"
          :id="item.id"
          :key="item.title"
          :name="item.title"
          :src="item.preview.videoSrc"
        />
        <nft-asset-card-mini
          v-for="item in nftItems"
          :key="item.name"
          :item="item"
        />
      </home-wallet-collectibles-wrapper>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { greaterThan } from '@/utils/bigmath';
import { formatToNative } from '@/utils/format';

import { NftAssetCardMini } from '@/components/nft';
import { NibbleShopProductMini } from '@/components/nibble-shop';

import HomeWalletCollectiblesWrapper from './home-wallet-collectibles-wrapper.vue';
import HomeWalletTokenItem from './home-wallet-token-item.vue';
import HomeWalletTokensWrapper from './home-wallet-tokens-wrapper.vue';

export default Vue.extend({
  name: 'HomeWallet',
  components: {
    HomeWalletTokensWrapper,
    HomeWalletTokenItem,
    HomeWalletCollectiblesWrapper,
    NftAssetCardMini,
    NibbleShopProductMini
  },
  computed: {
    ...mapState('account', {
      isTokensListLoaded: 'isTokensListLoaded'
    }),
    ...mapState('nft', {
      isNftListLoading: 'isLoading'
    }),
    ...mapState('shop', {
      isNibbleShopListLoading: 'isLoading'
    }),
    ...mapGetters('account', {
      balance: 'entireBalance',
      tokens: 'displayableWalletTokens'
    }),
    ...mapGetters('shop', { nibbleShopItems: 'accountAssets' }),
    ...mapGetters('nft', { nftItems: 'accountNfts' }),
    balanceNative(): string {
      return `$${formatToNative(this.balance)}`;
    },
    isTokensListLoading(): boolean {
      return !this.isTokensListLoaded;
    },
    showTokensList(): boolean {
      return (
        this.isTokensListLoading ||
        this.tokens.length > 0 ||
        greaterThan(this.balance, 0)
      );
    },
    isCollectiblesListLoading(): boolean {
      return this.isNftListLoading || this.isNibbleShopListLoading;
    },
    showCollectiblesList(): boolean {
      return (
        this.isCollectiblesListLoading ||
        this.nibbleShopItems.length + this.nftItems.length > 0
      );
    },
    showEmptyState(): boolean {
      return !this.showTokensList && !this.showCollectiblesList;
    }
  }
});
</script>
