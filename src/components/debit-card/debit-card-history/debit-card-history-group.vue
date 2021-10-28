<template>
  <div class="group">
    <div class="header">
      <p class="date">{{ date }}</p>
    </div>
    <div class="content">
      <debit-card-history-group-item
        v-for="item in items"
        :key="item.id"
        :description="item.description"
        :icon="item.icon"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { HistoryItem } from '@/store/modules/debit-card/types';

export default Vue.extend({
  name: 'DebitCardHistoryGroup',
  props: {
    date: {
      type: String,
      required: true
    },
    items: {
      type: Array as PropType<Array<HistoryItem>>,
      required: true
    }
  }
});
</script>
