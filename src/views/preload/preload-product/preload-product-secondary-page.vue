<template>
  <secondary-page class="manage">
    <template v-slot:title>
      <div class="secondary-page-header">
        <pu-skeleton class="title" tag="h1" width="150px" />
        <pu-skeleton class="description" tag="div" width="100px" />
      </div>
    </template>

    <div class="chart-wrapper">
      <bar-chart :chart-data-source="[]" is-loading />
      <pu-skeleton class="bottom-text" tag="div" width="300px" />
    </div>

    <div class="statements-list">
      <pu-skeleton class="header" tag="h2" width="250px" />

      <div v-for="idx in 3" :key="idx" class="item">
        <div class="info">
          <pu-skeleton circle class="icon" />
          <div class="progress-loader" />
          <div class="text">
            <pu-skeleton class="title" tag="h3" width="150px" />
            <pu-skeleton class="description" tag="div" width="250px" />
          </div>
        </div>
        <div class="action">
          <pu-skeleton
            class="skeleton button disabled no-padding"
            tag="div"
            width="80px"
          />
        </div>
      </div>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { BarChart } from '@/components/charts';
import { SecondaryPage } from '@/components/layout';

export default Vue.extend({
  name: 'PreloadProductSecondaryPage',
  components: {
    SecondaryPage,
    BarChart
  }
});
</script>
