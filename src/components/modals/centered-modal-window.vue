<template>
  <div>
    <toggle-target
      v-cloak
      :open-by-default="isActive"
      :toggle-group="modalId"
      :toggle-id="modalId"
    >
      <div
        v-if="disableCloseOnBackdrop"
        class="popup-bg popup-bg-active"
        :class="dimmerClass"
      >
        <close-button
          class="modal__popup-close modal__popup-close-active"
          is-black
          @close="handleClose"
        />
      </div>
      <toggle-action
        v-cloak
        v-else
        class="popup-bg popup-bg-active"
        :class="dimmerClass"
        :toggle-group="modalId"
        :toggle-id="modalId"
      >
        <close-button
          class="modal__popup-close modal__popup-close-active"
          is-black
          @close="handleClose"
        />
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
import { CloseButton } from '@/components/buttons';
import { toggleSingleItem } from '@/components/toggle/toggle-root';

export default Vue.extend({
  name: 'CenteredModalWindow',
  components: {
    CloseButton,
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
    },
    disableCloseOnBackdrop: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    closeButtonClass(): string {
      return 'transaction__popup-close transaction__popup-close-active';

      // TODO: refactor this
      // return `${this.modalClass}-close`;
    },
    dimmerClass(): string {
      return `${this.modalClass}-bg`;
    }
  },
  methods: {
    handleClose(): void {
      toggleSingleItem(this.modalId);
    }
  }
});
</script>
