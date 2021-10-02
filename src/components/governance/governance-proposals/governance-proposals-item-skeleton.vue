<template>
  <div class="governance__menu-wrapper-item">
    <div class="item__info active">
      <pu-skeleton circle class="progress-loader" color="#dcdcdc" tag="div" />
      <div class="item__info-label">
        <pu-skeleton color="#dcdcdc" tag="p" width="200px" />
        <pu-skeleton color="#dcdcdc" tag="span" width="80px" />
      </div>
    </div>
    <pu-skeleton
      class="item__link"
      color="#dcdcdc"
      height="42px"
      tag="div"
      width="91px"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'GovernanceProposalsItemSkeleton'
});
</script>
