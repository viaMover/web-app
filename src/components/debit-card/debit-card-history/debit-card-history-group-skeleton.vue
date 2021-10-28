<template>
  <div class="group">
    <div class="header">
      <pu-skeleton class="date" tag="p" width="150" />
    </div>
    <div class="content">
      <debit-card-history-group-item-skeleton
        v-for="idx in itemsCount"
        :key="idx"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import DebitCardHistoryGroupItemSkeleton from './debit-card-history-group-item-skeleton.vue';

export default Vue.extend({
  name: 'DebitCardHistoryGroupSkeleton',
  components: {
    DebitCardHistoryGroupItemSkeleton
  },
  props: {
    itemsCount: {
      type: Number,
      default: 2
    }
  }
});
</script>
