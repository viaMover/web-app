<template>
  <content-wrapper
    class="view-404"
    has-back-button
    page-content-class="centered"
    @back="handleBack"
  >
    <div class="container">
      <h1 class="title">404</h1>
      <p class="description">{{ $t('txtNotFound') }}</p>
    </div>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import ContentWrapper from '@/components/layout/content-wrapper.vue';

export default Vue.extend({
  name: 'View404',
  components: {
    ContentWrapper
  },
  methods: {
    handleBack(): void {
      this.$router.replace({
        name: 'home'
      });
    }
  }
});
</script>
