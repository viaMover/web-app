<template>
  <div v-if="displayOriginalImage" class="icon token-icon">
    <img
      v-fallback="imageFallbackOpts"
      :alt="$t('asset.txtAlt', { name: symbol })"
      :src="src"
      :style="shadowStyles"
    />

    <img
      v-if="shouldDisplayNetworkBadge"
      :alt="network"
      class="network"
      :src="networkInfo.baseAsset.iconURL"
    />
  </div>
  <div v-else class="icon token-icon fallback">
    <span>{{ truncatedSymbol }}</span>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapGetters } from 'vuex';

import { Properties } from 'csstype';

import { Network } from '@/utils/networkTypes';

import { IImageFallbackOpts } from './types';

export default Vue.extend({
  name: 'TokenImage',
  props: {
    address: {
      type: String,
      required: true
    },
    symbol: {
      type: String,
      required: true
    },
    src: {
      type: String,
      required: true
    },
    fallbackSrcList: {
      type: Array as PropType<Array<string>>,
      default: undefined
    },
    network: {
      type: String as PropType<Network | undefined>,
      default: undefined
    }
  },
  data() {
    return {
      loadingFailed: false
    };
  },
  computed: {
    ...mapGetters('account', { getTokenColor: 'getTokenColor' }),
    truncatedSymbol(): string {
      if (this.symbol.length > 5) {
        return `${this.symbol.toUpperCase().substr(0, 4)}...`;
      }
      return this.symbol.toUpperCase();
    },
    displayOriginalImage(): boolean {
      return this.src !== '' && !this.loadingFailed;
    },
    color(): string | undefined {
      return (
        this.getTokenColor(this.address) ?? 'var(--color-token-image-shadow)'
      );
    },
    shouldDisplayNetworkBadge(): boolean {
      return this.network !== undefined && this.currentNetwork !== this.network;
    },
    imageFallbackOpts(): IImageFallbackOpts {
      return {
        // synthetic bypass of warning by using the same source
        images: Array.isArray(this.fallbackSrcList)
          ? this.fallbackSrcList
          : [this.src],
        onError: this.handleError,
        loading: require('@/assets/images/ios-spinner.svg')
      };
    },
    shadowStyles(): Properties {
      return {
        boxShadow: `0 0 16px 0 ${this.color}`
      };
    }
  },
  methods: {
    handleError(): void {
      this.loadingFailed = true;
    }
  }
});
</script>
