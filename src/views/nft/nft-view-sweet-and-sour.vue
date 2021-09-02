<template>
  <shop-wrapper has-close-button @close="handleClose">
    <template v-slot:info>
      <h1 class="info__title">{{ $t('NFTs.lblSweetAndSour') }}</h1>
      <p class="info__description">
        {{ $t('NFTs.txtNFTs.sweetAndSour.pageDescriptionPartOne') }}
        <br /><br />
        {{ $t('NFTs.txtNFTs.sweetAndSour.pageDescriptionPartTwo') }}
      </p>
      <shop-list>
        <shop-list-item
          :title="$t('NFTs.lblTotalAmount')"
          :value="totalAmount"
        />
        <shop-list-item
          :title="$t('NFTs.lblTotalClaimed')"
          :value="totalClaimed"
        />
      </shop-list>
      <action-button
        button-class="button button-active"
        :text="$t('NFTs.btn.sweetAndSour.get.txt')"
      />
      <div v-if="hasError" class="error-message">{{ $t('NFTs.txtOhNo') }}</div>
    </template>
    <template v-slot:illustration>
      <video
        autoplay="autoplay"
        class="sweet-and-sour"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
        src="@/assets/videos/SweetAndSour.webm"
      />
    </template>
  </shop-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { ShopList, ShopListItem, ShopWrapper } from '@/components/layout';
import ActionButton from '@/components/buttons/action-button.vue';

export default Vue.extend({
  name: 'NftViewSweetAndSour',
  components: {
    ActionButton,
    ShopList,
    ShopListItem,
    ShopWrapper
  },
  computed: {
    ...mapState('nft', {
      totalAmount: 'SweetAndSourTotalAmount',
      totalClaimed: 'SweetAndSourTotalClaimed'
    }),
    hasError(): boolean {
      return false;
    }
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
