<template>
  <li>
    <button class="button-active" @click="handleClick">
      <span class="icon">{{ icon }}</span>
      <span class="description">{{ text }}</span>
    </button>
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
    modalId: {
      type: String as PropType<TModalKey>,
      default: ''
    },
    modalPayload: Object
  },
  methods: {
    ...mapActions('modals', { setIsModalDisplayed: 'setIsDisplayed' }),
    handleClick(): void {
      if (this.modalId !== '') {
        this.setIsModalDisplayed({
          id: this.modalId,
          value: true,
          payload: this.modalPayload ?? {}
        });
      } else {
        this.$emit('button-click');
      }
    }
  }
});
</script>
