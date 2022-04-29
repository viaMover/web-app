<template>
  <page class="savings" has-close-button @close="handleClose">
    <transition mode="out-in" name="fade">
      <router-view />
    </transition>
  </page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import Page from '@/components/v1.2/layout/page.vue';

export default Vue.extend({
  components: {
    Page
  },
  async mounted() {
    await this.loadInfo();
  },
  methods: {
    ...mapActions('savings', { loadInfo: 'loadInfo' }),
    handleClose(): void {
      this.$router.replace({ name: 'home' });
    }
  }
});
</script>
