<template>
  <shop-wrapper has-close-button @close="handleClose">
    <template v-slot:info>
      <h1 class="info__title">{{ $t('NFTs.lblMovingWithOlympus') }}</h1>
      <p class="info__description">
        {{ $t('NFTs.txtNFTs.movingWithOlympus.pageDescriptionPartOne') }}
        <br /><br />
        {{ $t('NFTs.txtNFTs.movingWithOlympus.pageDescriptionPartTwo') }}
      </p>
      <shop-list>
        <shop-list-item
          :title="$t('NFTs.lblAvailableFrom')"
          :value="availableFromString"
        />
        <shop-list-item
          :title="$t('NFTs.lblAvailableTo')"
          :value="availableToString"
        />
        <shop-list-item
          :title="$t('NFTs.lblTotalClaimed')"
          :value="totalClaimed"
        />
      </shop-list>
      <action-button
        button-class="button button-active"
        :text="$t('NFTs.btn.movingWithOlympus.get.txt')"
      />
      <div v-if="hasError" class="error-message">{{ $t('NFTs.txtOhNo') }}</div>
    </template>
    <template v-slot:illustration>
      <video
        autoplay="autoplay"
        class="moving-with-olympus"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
        src="@/assets/videos/MovingWithOlympus.mp4"
      />
    </template>
  </shop-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { ShopList, ShopListItem, ShopWrapper } from '@/components/layout';
import ActionButton from '@/components/buttons/action-button.vue';
import dayjs from 'dayjs';

export default Vue.extend({
  name: 'NftViewMovingWithOlympus',
  components: {
    ActionButton,
    ShopList,
    ShopListItem,
    ShopWrapper
  },
  computed: {
    ...mapState('nft', {
      //TODO use other store field
      availableTo: 'OlympusEndTs',
      totalClaimed: 'OlympusTotalClaimed',
      availableFrom: 'OlympusStartTs'
    }),
    hasError(): boolean {
      return false;
    },
    availableToString(): string {
      return dayjs.unix(this.availableTo).format('MMMM DD, HH:mm UTC');
    },
    availableFromString(): string {
      return dayjs.unix(this.availableFrom).format('MMMM DD, HH:mm UTC');
    }
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
