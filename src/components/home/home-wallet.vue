<template>
  <div class="wallet">
    <div class="list">
      <section class="group tokens">
        <h2 class="header complex">
          <span>{{ $t('lblTotalBalance') }}</span>
          <span>{{ balanceNative }}</span>
        </h2>

        <div class="items">
          <div v-for="token in tokens" :key="token.address" class="item">
            <token-image
              :address="token.address"
              :src="token.logo"
              :symbol="token.symbol"
            />
            <div class="description">
              <h3 class="title">{{ token.name }}</h3>
              <div class="value">
                {{ token.balanceFormatted }} {{ token.symbol }}
              </div>
            </div>
            <div class="balance">${{ token.balanceNativeFormatted }}</div>
          </div>
        </div>
      </section>

      <section v-if="showCollectibles" class="group collectibles">
        <h2 class="header">{{ $t('lblCollectibles') }}</h2>

        <div class="items product-carousel">
          <div class="items-wrapper">
            <nft-asset-card-mini
              v-for="item in nftItems"
              :key="item.name"
              :item="item"
            />
            <nibble-shop-product-mini
              v-for="item in nibbleShopItems"
              :id="item.id"
              :key="item.title"
              :name="item.title"
              :src="item.preview.videoSrc"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { formatToNative } from '@/utils/format';

import { NftAssetCardMini } from '@/components/nft';
import { NibbleShopProductMini } from '@/components/nibble-shop';
import { TokenImage } from '@/components/tokens';

export default Vue.extend({
  name: 'HomeWallet',
  components: {
    TokenImage,
    NftAssetCardMini,
    NibbleShopProductMini
  },
  computed: {
    ...mapGetters('account', {
      balance: 'entireBalance',
      tokens: 'displayableWalletTokens'
    }),
    ...mapGetters('shop', { nibbleShopItems: 'accountAssets' }),
    ...mapGetters('nft', { nftItems: 'accountNfts' }),
    balanceNative(): string {
      return `$${formatToNative(this.balance)}`;
    },
    showCollectibles(): boolean {
      return this.nibbleShopItems.length + this.nftItems.length > 0;
    }
  }
});
</script>
