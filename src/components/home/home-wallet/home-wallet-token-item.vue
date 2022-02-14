<template>
  <div class="item">
    <token-image
      :address="token.address"
      :src="token.logo"
      :symbol="token.symbol"
    />
    <div class="description">
      <h3 class="title">{{ token.name }}</h3>
      <div class="value">{{ token.balanceFormatted }} {{ token.symbol }}</div>
    </div>
    <div class="balance">${{ token.balanceNativeFormatted }}</div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { DisplayableToken } from '@/wallet/types';

import { TokenImage } from '@/components/tokens';

export default Vue.extend({
  name: 'HomeWalletTokenItem',
  components: {
    TokenImage
  },
  props: {
    token: {
      type: Object as PropType<DisplayableToken>,
      required: true
    }
  }
});
</script>
