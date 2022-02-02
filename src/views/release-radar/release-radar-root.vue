<template>
  <router-view />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

export default Vue.extend({
  name: 'ReleaseRadarRoot',
  beforeMount() {
    this.loadPersonalList();
    this.loadCuratedList();
  },
  methods: {
    ...mapActions('radar', ['loadPersonalList', 'loadCuratedList'])
  }
});
</script>
