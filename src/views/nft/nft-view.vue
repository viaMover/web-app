<template>
  <content-wrapper
    v-if="asset"
    has-back-button
    has-left-rail
    page-container-class="nft-drops-product-item"
    wrapper-class="nft-drops-product-item"
    @close="handleClose"
  >
    <template v-slot:left-rail>
      <nft-overview :item="asset" />
    </template>

    <secondary-page>
      <template v-slot:title>
        <secondary-page-title
          :icon-img-src="asset.nft.page.iconSrc"
          :title="$t('NFTs.lblNFTDrops')"
          wrapper-class="nft-drops-product-item-wrapper-title"
        >
          <template v-if="hasContextMenu" v-slot:context-menu>
            <context-button :popover-parent-id="popoverParentId">
              <context-button-item
                :text="$t('NFTs.btnClaimAndExchange.emoji')"
                @click="handleExecuteClaimAndExchange"
              />
              <context-button-item
                :text="$t('NFTs.btnExchange.emoji')"
                @click="handleExecuteExchange"
              />
              <context-button-item
                :text="$t('NFTs.btnClaim.emoji')"
                @click="handleExecuteClaim"
              />
            </context-button>
          </template>
        </secondary-page-title>
      </template>
      <div class="nft-drops-product-item-wrapper-banner" :style="bannerStyle">
        <video
          :alt="$t('NFTs.txtAssetAlt', { name: asset.nft.name })"
          autoplay
          data-keepplaying
          loop
          muted
          :src="asset.nft.page.videoSrc"
          :style="videoStyle"
        />
      </div>
      <div class="nft-drops-product-item-wrapper-info">
        <span>{{ asset.nft.id }}</span>
        <h3>{{ asset.nft.name }}</h3>
        <p>{{ asset.nft.page.description }}</p>
      </div>
    </secondary-page>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { Properties } from 'csstype';
import {
  ContentWrapper,
  SecondaryPage,
  SecondaryPageTitle
} from '@/components/layout';
import { NftOverview } from '@/components/nft';
import { ContextButton, ContextButtonItem } from '@/components/buttons';

export default Vue.extend({
  name: 'NftView',
  components: {
    ContentWrapper,
    SecondaryPage,
    NftOverview,
    ContextButton,
    ContextButtonItem,
    SecondaryPageTitle
  },
  data() {
    return {
      popoverParentId: 'nft-drops-action-buttons'
    };
  },
  computed: {
    ...mapState('nft', { assets: 'NFTs' }),
    id(): string {
      return this.$route.params.id;
    },
    hasContextMenu(): boolean {
      return this.asset !== null;
    },
    asset(): null {
      return null;
    },
    videoStyle(): Properties {
      return {
        maxWidth: ''
      };
    },
    bannerStyle(): Properties {
      return {
        background: ''
      };
    }
  },
  created() {
    if (this.asset === null) {
      this.$router.replace({ name: 'not-found-route' });
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
