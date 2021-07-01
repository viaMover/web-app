<template>
  <action-button
    button-class="context-button"
    :data-popover-parent-id="popoverParentId"
    @button-click="togglePopover"
  >
    <img alt="context button icon" src="@/assets/images/context-button.svg" />
    <popover :parent-id="popoverParentId" :popover-id="popoverId">
      <slot></slot>
    </popover>
  </action-button>
</template>

<script lang="ts">
import Vue from 'vue';
import { toggleSingleItem } from '@/components/toggle/toggle-root';

import { Popover } from '@/components/modals';
import ActionButton from '@/components/buttons/action-button.vue';

export default Vue.extend({
  name: 'context-button',
  components: { ActionButton, Popover },
  props: {
    popoverParentId: {
      type: String,
      required: true
    }
  },
  computed: {
    popoverId(): string {
      return this.popoverParentId + '__popover';
    }
  },
  methods: {
    togglePopover(): void {
      toggleSingleItem(this.popoverId);

      this.$emit('button-click', this.popoverParentId);
    }
  }
});
</script>

<style scoped></style>
