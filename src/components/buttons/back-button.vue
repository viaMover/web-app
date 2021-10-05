<template>
  <action-button :button-class="buttonClass" @button-click="handleClick">
    <img
      v-if="mode === 'CLOSE-BLACK'"
      :alt="$t('icon.txtCloseIconAlt')"
      src="@/assets/images/back_cross.svg"
    />
    <img
      v-else-if="mode === 'CLOSE'"
      :alt="$t('icon.txtCloseIconAlt')"
      src="@/assets/images/cross.svg"
    />
    <arrow-left-icon v-else />
  </action-button>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import ArrowLeftIcon from '@/components/controls/arrow-left-icon.vue';

import ActionButton from './action-button.vue';

export type BACK_BUTTON_MODE = 'BACK' | 'CLOSE' | 'CLOSE-BLACK';

export default Vue.extend({
  name: 'BackButton',
  components: {
    ArrowLeftIcon,
    ActionButton
  },
  props: {
    mode: {
      type: String as PropType<BACK_BUTTON_MODE>,
      default: 'BACK'
    }
  },
  computed: {
    buttonClass(): string {
      return `button ${
        this.mode === 'BACK' ? 'back-link' : 'escape-link'
      } button-active`;
    }
  },
  methods: {
    handleClick() {
      this.$emit('close');
    }
  }
});
</script>

<style scoped></style>
