<template>
  <div>
    <label class="form-label" :for="inputId" @click.prevent.stop="handleClick">
      {{ labelText }}
    </label>
    <base-dropdown
      disabled
      has-custom-selected-option
      :input-id="inputId"
      label="address"
      :options="[]"
      :value="currentAsset"
      @open="handleClick"
    >
      <template v-slot:selected-option="token">
        <token-image
          :address="tokenAddress"
          hide-shadow
          :src="tokenImageSrc"
          :symbol="tokenSymbol"
        />
        {{ token.symbol }}
      </template>
    </base-dropdown>
    <p class="form-text">
      <slot>{{ descriptionText }}</slot>
    </p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { SmallTokenInfo, SmallTokenInfoWithIcon, Token } from '@/wallet/types';

import TokenImage from '@/components/tokens/token-image.vue';
import BaseDropdown from '@/components/v1.2/base-dropdown.vue';

export default Vue.extend({
  name: 'TokenSelector',
  components: {
    TokenImage,
    BaseDropdown
  },
  props: {
    currentAsset: {
      type: Object as PropType<
        SmallTokenInfo | SmallTokenInfoWithIcon | Token | undefined
      >,
      default: undefined
    },
    labelText: {
      type: String,
      required: true
    },
    inputId: {
      type: String,
      required: true
    },
    descriptionText: {
      type: String,
      default: undefined
    }
  },
  computed: {
    tokenAddress(): string {
      return this.currentAsset?.address ?? '';
    },
    tokenImageSrc(): string {
      if (this.currentAsset === undefined) {
        return '';
      }

      if ('iconURL' in this.currentAsset) {
        return this.currentAsset.iconURL;
      }

      if ('logo' in this.currentAsset) {
        return this.currentAsset.logo;
      }

      return '';
    },
    tokenSymbol(): string {
      return this.currentAsset?.symbol ?? '';
    }
  },
  methods: {
    handleClick(): void {
      this.$emit('select');
    }
  }
});
</script>
