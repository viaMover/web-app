<template>
  <li class="item">
    <pu-skeleton :class="descriptionClass" tag="h3" width="190px" />
    <pu-skeleton :class="valueClass" tag="span" width="90px" />
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'GovernanceOverviewSectionItemSkeleton',
  props: {
    descriptionClass: {
      type: String,
      default: ''
    },
    valueClass: {
      type: String,
      default: ''
    }
  }
});
</script>
