<template>
  <router-view />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

export default Vue.extend({
  name: 'EarningsRoot',
  async mounted() {
    await this.loadMinimalInfo();
  },
  methods: {
    ...mapActions('earnings', {
      loadMinimalInfo: 'loadMinimalInfo'
    })
  }
});
</script>
