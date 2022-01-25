<template>
  <div>
    <button
      class="button-like"
      :class="buttonClass"
      :data-popover-parent-id="popoverParentId"
      type="button"
      @click="togglePopover"
    >
      <slot name="button">
        <img
          :alt="$t('icon.txtContextButtonAlt')"
          src="@/assets/images/context-button.svg"
        />
      </slot>
    </button>
    <popover :parent-id="popoverParentId" :popover-id="popoverId">
      <slot></slot>
    </popover>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { Popover } from '@/components/modals';
import { toggleSingleItem } from '@/components/toggle/toggle-root';

export default Vue.extend({
  name: 'ContextButton',
  components: { Popover },
  props: {
    popoverParentId: {
      type: String,
      required: true
    },
    buttonClass: {
      type: String,
      default: undefined
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
