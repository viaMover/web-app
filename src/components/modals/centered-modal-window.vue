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
        class="ui dimmer"
        :toggle-group="modalId"
        :toggle-id="modalId"
      />
    </toggle-target>

    <toggle-target
      v-cloak
      class="ui center modal"
      :class="{ tiny: isTiny }"
      :open-by-default="isActive"
      :toggle-group="modalId"
      :toggle-id="modalId"
    >
      <div class="content">
        <div class="ui header">
          <span v-if="headerLabel">
            {{ headerLabel }}
          </span>
          <span v-else>&nbsp;</span>
          <div class="right floated icon">
            <toggle-action :toggle-group="modalId" :toggle-id="modalId">
              <i class="right floated link remove icon" />
            </toggle-action>
          </div>
        </div>
        <slot />
      </div>
    </toggle-target>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { ToggleAction, ToggleTarget } from '@/components/toggle';
import { toggleModal } from '@/components/toggle/toggle-root';

export default Vue.extend({
  name: 'CenteredModal',
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
    isTiny: {
      type: Boolean,
      default: true
    },
    headerLabel: {
      type: String,
      default: ''
    },
    backLabel: {
      type: String,
      default: ''
    }
  },
  methods: {
    toggleModal(): void {
      toggleModal(this.modalId);
    },
    handleToggle(payload: never): void {
      this.$emit('toggle', payload);
    }
  }
});
</script>
