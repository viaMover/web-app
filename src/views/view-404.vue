<template>
  <content-wrapper
    base-class="not-found"
    has-back-button
    wrapper-class="not-found"
    @close="handleClose"
  >
    <h1>404</h1>
    <p>{{ $t('txtNotFound') }}</p>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import ContentWrapper from '@/components/layout/content-wrapper.vue';

import '@/styles/_404.less';

export default Vue.extend({
  name: 'View404',
  components: {
    ContentWrapper
  },
  methods: {
    handleClose(): void {
      this.$router.replace({
        name: 'home'
      });
    }
  }
});
</script>
