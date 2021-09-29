<template>
  <pu-skeleton-theme color="#dcdcdc">
    <div v-for="idx in number" :key="idx" class="item__column">
      <div class="item__column-info active">
        <pu-skeleton circle class="loading" tag="div" />
        <div class="item__column-info-label">
          <pu-skeleton tag="p" />
          <pu-skeleton tag="span" />
        </div>
      </div>
      <div class="item__column-link">
        <pu-skeleton class="button-active" tag="a" />
      </div>
    </div>
  </pu-skeleton-theme>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'GovernanceProposalsItemSkeleton',
  props: {
    number: {
      type: Number,
      default: 1
    }
  }
});
</script>
