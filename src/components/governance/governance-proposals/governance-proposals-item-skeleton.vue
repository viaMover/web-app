<template>
  <div class="governance__menu-wrapper-item">
    <div class="item__info active">
      <pu-skeleton circle class="progress-loader" tag="div" />
      <div class="item__info-label">
        <pu-skeleton tag="p" width="200px" />
        <pu-skeleton tag="span" width="80px" />
      </div>
    </div>
    <pu-skeleton class="item__link" height="42px" tag="div" width="91px" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'GovernanceProposalsItemSkeleton'
});
</script>
