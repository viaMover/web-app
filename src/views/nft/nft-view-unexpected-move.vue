<template>
  <shop-wrapper has-close-button @close="handleClose">
    <template v-slot:info>
      <h1 class="info__title">Unexpected Move</h1>
      <p class="info__description">
        This NFT is dropped for all participants in our Twitter promo.
        <br /><br />
        The Unexpected Move NFT can be exchanged for 1 MOVE token, but only
        once.
      </p>
      <shop-list>
        <shop-list-item :title="$t('Total amount')" value="247" />
        <shop-list-item :title="$t('Total claimed')" value="16" />
        <shop-list-item :title="$t('Total exchanged')" value="14" />
      </shop-list>
      <action-button
        button-class="button button-active"
        text="Get my Unexpected Move"
      />
      <div class="info__more">
        <p>{{ $t('NFTs.txtWhatElseCanDo') }}</p>
        <ul>
          <li>
            <button class="button-active" type="button">
              <span class="icon">🦍</span>
              <span class="description"></span>
            </button>
          </li>
          <li>
            <button class="button-active" type="button">
              <span class="icon">🔄</span>
              <span class="description">Exchange for MOVE</span>
            </button>
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
        src="videos/unexpected-move-gif.webm"
      />
    </template>
  </shop-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ShopWrapper, ShopList, ShopListItem } from '@/components/layout';
import ActionButton from '@/components/buttons/action-button.vue';

export default Vue.extend({
  name: 'NftViewUnexpectedMove',
  components: {
    ActionButton,
    ShopList,
    ShopListItem,
    ShopWrapper
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
