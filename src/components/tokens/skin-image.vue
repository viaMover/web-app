<template>
  <div v-if="displayOriginalImage" class="icon token-icon">
    <img
      v-fallback="imageFallbackOpts"
      :alt="$t('debitCard.txtSymbolImageAlt', { name: symbol })"
      :src="src"
      :style="shadowStyles"
    />
  </div>
  <div v-else class="icon">
    <div class="img-stub" :style="shadowStyles">
      <span>{{ truncatedSymbol }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Properties } from 'csstype';

import { IImageFallbackOpts } from './types';

export default Vue.extend({
  name: 'SkinImage',
  props: {
    id: {
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
    color: {
      type: String,
      default: 'rgba(0, 0, 0, 50%)'
    }
  },
  data() {
    return {
      loadingFailed: false
    };
  },
  computed: {
    truncatedSymbol(): string {
      if (this.symbol.length > 5) {
        return `${this.symbol.toUpperCase().substr(0, 4)}...`;
      }
      return this.symbol.toUpperCase();
    },
    displayOriginalImage(): boolean {
      return this.src !== '' && !this.loadingFailed;
    },
    imageFallbackOpts(): IImageFallbackOpts {
      return {
        // synthetic bypass of warning by using the same source
        images: Array.isArray(this.fallbackSrcList)
          ? this.fallbackSrcList
          : [this.src],
        onError: this.handleError
      };
    },
    shadowStyles(): Properties {
      return {
        boxShadow: `0px 0px 16px ${this.color}`
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
