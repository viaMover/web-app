<template>
  <div class="history-group">
    <div class="header">
      <p class="date">{{ date }}</p>
    </div>

    <div class="items">
      <debit-card-history-group-item
        v-for="item in items"
        :key="item.timestamp"
        :description="item.description"
        :icon="item.icon"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { EventHistoryItem } from '@/store/modules/debit-card/types';

import DebitCardHistoryGroupItem from './debit-card-history-group-item.vue';

export default Vue.extend({
  name: 'DebitCardHistoryGroup',
  components: {
    DebitCardHistoryGroupItem
  },
  props: {
    date: {
      type: String,
      required: true
    },
    items: {
      type: Array as PropType<Array<EventHistoryItem>>,
      required: true
    }
  }
});
</script>
