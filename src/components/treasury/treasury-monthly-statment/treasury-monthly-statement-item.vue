<template>
  <li>
    <p class="description">{{ title }}</p>
    <span class="value">{{ value }}</span>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TreasuryMonthlyStatementsItem',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    }
  }
});
</script>
