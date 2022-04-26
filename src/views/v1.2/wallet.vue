<template>
  <content-wrapper class="wallet" has-close-button @close="handleClose">
    <div class="heading">
      <p class="title">{{ $t('walletBalance') }}</p>
      <h1 class="value">{{ formattedWalletBalanceNative }}</h1>
    </div>

    <div v-if="showEmptyState" class="empty-state">
      {{ $t('lblNewToMover') }}
    </div>
    <div v-else class="list">
      <home-wallet-tokens-wrapper
        v-if="showTokensList"
        :is-loading="isTokensListLoading"
      >
        <template v-slot:header>
          <h2 class="header">{{ $t('tokens') }}</h2>
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
          <h2 class="header">{{ $t('collectibles') }}</h2>
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
          :key="item.id"
          :item="item"
        />
      </home-wallet-collectibles-wrapper>
    </div>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { greaterThan } from '@/utils/bigmath';

import HomeWalletCollectiblesWrapper from '@/components/home/home-wallet/home-wallet-collectibles-wrapper.vue';
import HomeWalletTokenItem from '@/components/home/home-wallet/home-wallet-token-item.vue';
import HomeWalletTokensWrapper from '@/components/home/home-wallet/home-wallet-tokens-wrapper.vue';
import { ContentWrapper } from '@/components/layout';
import { NftAssetCardMini } from '@/components/nft';
import { NibbleShopProductMini } from '@/components/nibble-shop';

export default Vue.extend({
  components: {
    ContentWrapper,
    HomeWalletTokensWrapper,
    HomeWalletTokenItem,
    HomeWalletCollectiblesWrapper,
    NftAssetCardMini,
    NibbleShopProductMini
  },
  computed: {
    ...mapGetters('account', {
      walletBalanceNative: 'entireBalance'
    }),
    formattedWalletBalanceNative(): string {
      return this.formatAsNativeCurrency(this.walletBalanceNative);
    },
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
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
