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
import { toggleSingleItem } from '@/components/toggle/toggle-root';

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
      toggleSingleItem(this.modalId);
    }
  }
});
</script>

<style scoped lang="less">
.ui.dimmer {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

.ui.modal {
  position: fixed;
  left: auto;
  top: 50%;
  text-align: left;
  overflow-y: auto;
  transform-origin: 50% 0;

  &.center {
    top: 20%;
  }
}

.content {
  background-color: white;
  padding: 1rem;
  min-width: 50vw;
  min-height: 50vh;
}
</style>
