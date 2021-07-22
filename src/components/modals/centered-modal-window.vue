<template>
  <div>
    <toggle-target
      v-cloak
      :open-by-default="isActive"
      :toggle-group="modalId"
      :toggle-id="modalId"
    >
      <toggle-action
        v-cloak
        class="popup-bg popup-bg-active"
        :class="dimmerClass"
        :toggle-group="modalId"
        :toggle-id="modalId"
      >
        <div class="button-active" :class="closeButtonClass">
          <img alt="close icon" src="@/assets/images/cross.svg" />
        </div>
      </toggle-action>
    </toggle-target>

    <toggle-target
      v-cloak
      class="modal__popup modal__wrapper"
      :open-by-default="isActive"
      :toggle-group="modalId"
      :toggle-id="modalId"
    >
      <slot />
    </toggle-target>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { ToggleAction, ToggleTarget } from '@/components/toggle';

export default Vue.extend({
  name: 'CenteredModalWindow',
  components: {
    ToggleAction,
    ToggleTarget
  },
  props: {
    modalId: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    modalClass: {
      type: String,
      default: ''
    },
    backLabel: {
      type: String,
      default: ''
    }
  },
  computed: {
    closeButtonClass(): string {
      return `${this.modalClass}-close`;
    },
    dimmerClass(): string {
      return `${this.modalClass}-bg`;
    }
  }
});
</script>
