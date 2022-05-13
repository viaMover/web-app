<template>
  <div class="section arrow">
    <div class="item">
      <slot name="first-token-image">
        <template v-if="left">
          <custom-picture
            v-if="isLeftPictureDescriptor"
            :alt="left.alt"
            :sources="left.sources"
            :src="left.src"
            :webp-sources="left.webpSources"
          />
          <token-image
            v-else
            :address="left.address"
            class="no-margin item-coin"
            hide-shadow
            :src="left.logo"
            :symbol="left.symbol"
          />
        </template>
      </slot>
    </div>
    <div class="item">
      <div class="item-arrow">
        <span />
        <span />
      </div>
    </div>
    <div class="item item-image">
      <slot name="second-token-image">
        <template v-if="right">
          <custom-picture
            v-if="isRightPictureDescriptor"
            :alt="right.alt"
            :sources="right.sources"
            :src="right.src"
            :webp-sources="right.webpSources"
          />
          <token-image
            v-else
            :address="right.address"
            class="no-margin item-coin"
            hide-shadow
            :src="right.logo"
            :symbol="right.symbol"
          />
        </template>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Token } from '@/wallet/types';

import { PictureDescriptor } from '@/components/html5';
import CustomPicture from '@/components/html5/custom-picture.vue';
import { isPictureDescriptor } from '@/components/html5/types';
import TokenImage from '@/components/tokens/token-image.vue';

export default Vue.extend({
  name: 'FormDirectionPair',
  components: {
    TokenImage,
    CustomPicture
  },
  props: {
    left: {
      type: Object as PropType<Token | PictureDescriptor>,
      default: undefined
    },
    right: {
      type: Object as PropType<Token | PictureDescriptor>,
      default: undefined
    }
  },
  computed: {
    isLeftPictureDescriptor(): boolean {
      return isPictureDescriptor(this.left);
    },
    isRightPictureDescriptor(): boolean {
      return isPictureDescriptor(this.right);
    }
  }
});
</script>
