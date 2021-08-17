<template>
  <div class="button burger-menu" :class="wrapperClass">
    <action-button
      :button-class="actionButtonClass"
      :data-popover-parent-id="popoverParentId"
      @button-click="togglePopover"
    >
      <slot name="button">
        <img
          :alt="$t('icon.txtContextButtonAlt')"
          src="@/assets/images/context-button.svg"
        />
      </slot>
    </action-button>
    <popover :parent-id="popoverParentId" :popover-id="popoverId">
      <slot></slot>
    </popover>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { toggleSingleItem } from '@/components/toggle/toggle-root';

import { Popover } from '@/components/modals';
import ActionButton from '@/components/buttons/action-button.vue';

import '@/styles/_burger.less';

export default Vue.extend({
  name: 'ContextButton',
  components: { ActionButton, Popover },
  props: {
    popoverParentId: {
      type: String,
      required: true
    },
    wrapperClass: {
      type: String,
      default: ''
    },
    buttonClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    popoverId(): string {
      return this.popoverParentId + '__popover';
    },
    actionButtonClass(): string {
      if (this.buttonClass === '') {
        return 'button-active';
      }

      return `${this.buttonClass} button-active`;
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
