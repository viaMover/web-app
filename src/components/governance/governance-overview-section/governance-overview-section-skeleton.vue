<template>
  <div>
    <div v-if="hasTitle">
      <pu-skeleton class="subtitle" height="42px" tag="h2" width="280px" />
    </div>
    <div class="overview__wrapper-items">
      <ul>
        <slot></slot>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'GovernanceOverviewSectionSkeleton',
  props: {
    hasTitle: {
      type: Boolean,
      default: false
    }
  }
});
</script>
