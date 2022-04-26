<template>
  <div class="item">
    <div class="info">
      <pu-skeleton circle class="progress-loader" tag="div" />
      <div class="text">
        <pu-skeleton class="title" tag="h3" width="200px" />
        <pu-skeleton class="description" tag="div" width="80px" />
      </div>
    </div>
    <div v-if="!hideNavLink" class="action">
      <pu-skeleton
        class="button disabled no-padding skeleton"
        height="40px"
        tag="div"
        width="80px"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'GovernanceProposalsItemSkeleton',
  props: {
    hideNavLink: {
      type: Boolean,
      default: false
    }
  }
});
</script>
