<template>
  <transition mode="out-in" name="slide">
    <router-view />
  </transition>
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
