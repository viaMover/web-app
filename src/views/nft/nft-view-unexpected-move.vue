<template>
  <shop-wrapper has-close-button @close="handleClose">
    <template v-slot:info>
      <h1 class="info__title">{{ $t('NFTs.lblUnexpectedMove') }}</h1>
      <p class="info__description">
        {{ $t('NFTs.txtNFTs.unexpectedMove.pageDescriptionPartOne') }}
        <br /><br />
        {{ $t('NFTs.txtNFTs.unexpectedMove.pageDescriptionPartTwo') }}
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
        <shop-list-item
          :title="$t('NFTs.lblTotalExchanged')"
          :value="totalExchanged"
        />
      </shop-list>
      <action-button
        button-class="button button-active"
        :text="$t('NFTs.btn.unexpectedMove.get.txt')"
      />
      <div v-if="hasError" class="error-message">{{ $t('NFTs.txtOhNo') }}</div>
      <div class="info__more">
        <p>{{ $t('NFTs.lblWhatElseCanDo') }}</p>
        <ul>
          <li>
            <emoji-text-button
              button-class="button-active"
              :emoji="$t('NFTs.btn.unexpectedMove.claimAndExchange.emoji')"
              :text="$t('NFTs.btn.unexpectedMove.claimAndExchange.txt')"
            />
          </li>
          <li>
            <emoji-text-button
              button-class="button-active"
              :emoji="$t('NFTs.btn.unexpectedMove.exchange.emoji')"
              :text="$t('NFTs.btn.unexpectedMove.exchange.txt')"
            />
          </li>
        </ul>
      </div>
    </template>
    <template v-slot:illustration>
      <video
        autoplay="autoplay"
        class="unexpected-move"
        data-keepplaying="data-keepplaying"
        loop="loop"
        muted="muted"
        playsinline="playsinline"
        src="@/assets/videos/UnexpectedMove.webm"
      />
    </template>
  </shop-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { ShopWrapper, ShopList, ShopListItem } from '@/components/layout';
import ActionButton from '@/components/buttons/action-button.vue';
import EmojiTextButton from '@/components/buttons/emoji-text-button.vue';

export default Vue.extend({
  name: 'NftViewUnexpectedMove',
  components: {
    EmojiTextButton,
    ActionButton,
    ShopList,
    ShopListItem,
    ShopWrapper
  },
  computed: {
    ...mapState('nft', {
      totalAmount: 'UnexpectedMoveTotalAmount',
      totalClaimed: 'UnexpectedMoveTotalClaimed',
      totalExchanged: 'UnexpectedMoveTotalExchanged'
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
