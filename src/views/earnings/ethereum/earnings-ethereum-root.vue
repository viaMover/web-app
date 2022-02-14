<template>
  <transition mode="out-in" name="slide">
    <router-view />
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

export default Vue.extend({
  name: 'EarningsEthereumRoot',
  async mounted() {
    await this.loadInfo();
  },
  methods: {
    ...mapActions('earnings/ethereum', {
      loadInfo: 'loadInfo'
    })
  }
});
</script>
