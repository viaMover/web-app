<template>
  <shop-wrapper has-close-button @close="handleClose">
    <template v-slot:info>
      <h1 class="info__title">{{ product.title }}</h1>
      <p class="info__description">
        {{ product.page.description }}
      </p>
      <shop-list>
        <shop-list-item
          :title="$t('nibbleShop.lblTotalAvailable')"
          :value="product.availableQuantity"
        />
        <shop-list-item
          :title="$t('nibbleShop.lblPrice')"
          :value="product.price"
        />
      </shop-list>
      <action-button
        button-class="button button-active"
        :text="$t('nibbleShop.btn.get.txt', { item: product.shortName })"
        @button-click="handleBuy"
      />
      <div v-if="getTokenError !== undefined" class="error-message">
        {{ getTokenError }}
      </div>
      <div class="info__more">
        <p>{{ $t('nibbleShop.lblWhatElseCanDo') }}</p>
        <ul>
          <li>
            <emoji-text-button
              button-class="button-active"
              :emoji="$t('nibbleShop.btn.redeem.emoji')"
              :text="$t('nibbleShop.btn.redeem.txt')"
              @button-click="handleRedeem"
            />
          </li>
          <li>
            <div v-if="actionError !== undefined" class="error-message">
              {{ actionError }}
            </div>
          </li>
        </ul>
      </div>
    </template>
    <template v-slot:illustration>
      <video
        autoplay="autoplay"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
        :style="videoStyle"
      >
        <source :src="product.page.videoSrc" type="video/webm" />
      </video>
    </template>
  </shop-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { Properties } from 'csstype';

import { Asset } from '@/store/modules/shop/types';

import { ActionButton, EmojiTextButton } from '@/components/buttons';
import { Step } from '@/components/forms/form-loader';
import { ShopList, ShopListItem, ShopWrapper } from '@/components/layout';

export default Vue.extend({
  name: 'NibbleShopView',
  components: {
    EmojiTextButton,
    ActionButton,
    ShopList,
    ShopListItem,
    ShopWrapper
  },
  data() {
    return {
      transactionStep: undefined as Step | undefined,
      getTokenError: undefined as string | undefined,
      actionError: undefined as string | undefined
    };
  },
  computed: {
    ...mapState('shop', { products: 'assets' }),
    id(): string {
      return this.$route.params.id;
    },
    videoStyle(): Properties {
      return {
        backgroundColor: this.product?.page.background
      };
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
      this.$router.push({
        name: 'nibble-shop-redeem',
        params: { id: this.id }
      });
    }
  }
});
</script>
