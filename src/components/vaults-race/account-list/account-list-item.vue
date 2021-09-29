<template>
  <div class="item__info">
    <div class="item__info-icon">
      <span>{{ icon }}</span>
    </div>
    <progress-loader
      class="progress-loader"
      :is-animated="true"
      :value="progress"
    />
    <div class="item__info-label">
      <p>{{ title }}</p>
      <span>{{ description }}</span>
    </div>
    <div class="item__link">
      <span v-if="tagText !== ''" class="tag">{{ tagText }}</span>
      <action-button
        button-class="button button-active"
        :disabled="disabledButton"
        :text="buttonText"
        @button-click="handleButton"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { ActionButton } from '@/components/buttons';
import ProgressLoader from '@/components/statements/progress-loader.vue';

export default Vue.extend({
  name: 'AccountListItem',
  components: {
    ActionButton,
    ProgressLoader
  },
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    buttonText: {
      type: String,
      required: true
    },
    tagText: {
      type: String,
      default: ''
    },
    progress: {
      type: Number,
      default: 100
    },
    disabledButton: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleButton(): void {
      this.$emit('button-click');
    }
  }
});
</script>
