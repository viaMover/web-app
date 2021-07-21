<template>
  <centered-modal-window v-cloak :modal-class="modalClass" :modal-id="modalId">
    <slot></slot>
  </centered-modal-window>
</template>

<script lang="ts">
import Vue from 'vue';

import CenteredModalWindow from './centered-modal-window.vue';

export default Vue.extend({
  name: 'SwapModal',
  components: {
    CenteredModalWindow
  },
  props: {
    modalId: {
      type: String,
      required: true
    },
    modalClass: {
      type: String,
      required: true
    }
  }
});
</script>
