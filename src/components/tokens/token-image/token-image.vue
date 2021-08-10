<template>
  <div v-if="displayOriginalImage" :class="wrapperClass">
    <img
      v-fallback="imageFallbackOpts"
      :alt="$t('asset.txtAlt', { name: symbol })"
      :src="src"
      :style="shadowStyles"
    />
  </div>
  <div v-else :class="wrapperClass">
    <div class="img-stub" :style="shadowStyles">
      <span>{{ symbol }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapGetters } from 'vuex';
import { Properties } from 'csstype';

import { IImageFallbackOpts } from '@/components/tokens/token-image/types';

export default Vue.extend({
  name: 'TokenImage',
  props: {
    wrapperClass: {
      type: String,
      default: 'label-icon'
    },
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
    displayOriginalImage(): boolean {
      return this.src !== '' && !this.loadingFailed;
    },
    color(): string | undefined {
      return this.getTokenColor(this.address) ?? 'rgba(0, 0, 0, 50%)';
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
