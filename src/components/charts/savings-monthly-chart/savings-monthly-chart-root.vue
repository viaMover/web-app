<template>
  <div class="chart-group-wrapper">
    <div class="button-wrapper">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        @click.prevent.stop="toggleTab(tab)"
      >
        {{ tab }}
      </button>
    </div>
    <keep-alive>
      <component :is="currentTab" />
    </keep-alive>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import MonthSpan from './month-span.vue';
import WeekSpan from './week-span.vue';
import DaySpan from './day-span.vue';

const tabs = ['MonthSpan', 'WeekSpan', 'DaySpan'];

export default Vue.extend({
  name: 'SavingsMonthlyChartRoot',
  components: {
    MonthSpan,
    WeekSpan,
    DaySpan
  },
  data() {
    return {
      tabs,
      currentTab: tabs[0]
    };
  },
  methods: {
    toggleTab(tab: string) {
      this.currentTab = tab;
    }
  }
});
</script>

<style scoped></style>
