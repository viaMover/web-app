<template>
  <page class="home">
    <the-masthead />

    <transition mode="out-in" name="fade">
      <router-view />
    </transition>
  </page>
</template>

<script lang="ts">
import Vue from 'vue';

import TheMasthead from '@/components/v1.2/home/portfolio/the-masthead.vue';
import Page from '@/components/v1.2/layout/page.vue';

export default Vue.extend({
  components: {
    Page,
    TheMasthead
  }
});
</script>
