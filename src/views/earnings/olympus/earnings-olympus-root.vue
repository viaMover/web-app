<template>
  <router-view />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

export default Vue.extend({
  name: 'EarningsOlympusRoot',
  async mounted() {
    await this.loadInfo();
  },
  methods: {
    ...mapActions('earnings/olympus', {
      loadInfo: 'loadInfo'
    })
  }
});
</script>
