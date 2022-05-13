<template>
  <base-button v-bind="$attrs" class="round button-back" v-on="$listeners">
    <base-icon icon-class="icon-back" />
  </base-button>
</template>

<script lang="ts">
import Vue from 'vue';

import BaseIcon from '@/components/v1.2/base-icon.vue';

import BaseButton from './base-button.vue';

export default Vue.extend({
  name: 'BackButton',
  components: {
    BaseButton,
    BaseIcon
  }
});
</script>
