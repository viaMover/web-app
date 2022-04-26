<template>
  <div class="list">
    <div v-for="idx in 3" :key="idx" class="group transactions">
      <pu-skeleton class="header" tag="h2" />
      <div class="items">
        <div v-for="innerIdx in 2" :key="innerIdx" class="item">
          <pu-skeleton circle class="icon token-icon" tag="div" />
          <div class="description">
            <pu-skeleton class="title" tag="h3" />
            <pu-skeleton class="value" tag="div" />
          </div>
          <pu-skeleton class="outcome" tag="div" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TransactionsListSkeleton'
});
</script>
