<template>
  <div v-if="displayOriginalImage" class="icon token-icon">
    <img
      v-fallback="imageFallbackOpts"
      :alt="$t('asset.txtAlt', { name: symbol })"
      :src="src"
      :style="shadowStyles"
    />
  </div>
  <div v-else class="icon fallback" :style="shadowStyles">
    <span>{{ truncatedSymbol }}</span>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapGetters } from 'vuex';

import { Properties } from 'csstype';

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
      return this.getTokenColor(this.address) ?? 'var(--shadow)';
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
      if (this.displayOriginalImage) {
        return {
          filter: `drop-shadow(0 4px 16px ${this.color})`
        };
      }

      return {
        boxShadow: `drop-shadow(0 4px 16px 0 ${this.color})`
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
