<template>
  <li class="button-active" :class="wrapperClass" @click="handleOpenModal">
    <div class="icon">{{ icon }}</div>
    <div class="text">{{ text }}</div>
  </li>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { toggleSingleItem } from '@/components/toggle/toggle-root';
import { Modal } from '@/components/modals';

export default Vue.extend({
  name: 'MenuListIconItem',
  props: {
    icon: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    wrapperClass: {
      type: String,
      default: ''
    },
    modalId: {
      type: String as PropType<Modal>,
      default: ''
    }
  },
  methods: {
    handleOpenModal(): void {
      if (this.modalId !== '') {
        toggleSingleItem(this.modalId);
      }
    }
  }
});
</script>
