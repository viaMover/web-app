<template>
  <div class="item">
    <div class="icon action">
      <pu-skeleton tag="span" />
    </div>
    <pu-skeleton class="description" tag="div" :width="500" />
    <div class="icon checkmark">
      <pu-skeleton tag="span" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'DebitCardHistoryGroupItemSkeleton',
  functional: true
});
</script>
