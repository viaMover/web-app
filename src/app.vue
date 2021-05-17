<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { mapActions } from 'vuex';
import Vue from 'vue';

export default Vue.extend({
  name: 'App',
  mounted() {
    this.setI18n(this.$i18n);
  },
  methods: {
    ...mapActions(['setI18n'])
  }
});
</script>
