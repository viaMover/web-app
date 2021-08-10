<template>
  <li class="button-active" :class="wrapperClass" @click="handleClick">
    <div class="icon">{{ icon }}</div>
    <div class="text">{{ text }}</div>
  </li>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapActions } from 'vuex';

import { TModalKey } from '@/store/modules/modals/types';

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
      type: String as PropType<TModalKey>,
      default: ''
    }
  },
  methods: {
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
    handleClick(): void {
      if (this.modalId !== '') {
        this.setIsModalDisplayed({ id: this.modalId, value: true });
      } else {
        this.$emit('button-click');
      }
    }
  }
});
</script>
