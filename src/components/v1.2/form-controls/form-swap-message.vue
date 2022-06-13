<template>
  <div class="swap-message description">
    <span class="action">{{ $t('swappingFor') }}</span>
    <custom-picture v-bind="picture" class="icon" />
    <span class="amount">{{ amount }}</span>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { SmallTokenInfoWithIcon, Token } from '@/wallet/types';

import { CustomPicture, PictureDescriptor } from '@/components/html5';
import { isPictureDescriptor } from '@/components/html5/types';

export default Vue.extend({
  components: {
    CustomPicture
  },
  props: {
    targetToken: {
      type: Object as PropType<
        PictureDescriptor | Token | SmallTokenInfoWithIcon
      >,
      required: true
    },
    amount: {
      type: [Number, String],
      required: true
    }
  },
  computed: {
    picture(): PictureDescriptor {
      if (isPictureDescriptor(this.targetToken)) {
        return this.targetToken;
      }

      if ('iconURL' in this.targetToken) {
        return {
          src: this.targetToken.iconURL
        };
      }

      return {
        src: this.targetToken.logo
      };
    }
  }
});
</script>
