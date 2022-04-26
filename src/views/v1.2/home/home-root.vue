<template>
  <content-wrapper class="home">
    <the-masthead />

    <transition mode="out-in" name="fade">
      <router-view />
    </transition>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { ContentWrapper } from '@/components/layout';
import TheMasthead from '@/components/v1.2/home/portfolio/the-masthead.vue';

export default Vue.extend({
  components: {
    TheMasthead,
    ContentWrapper
  }
});
</script>
