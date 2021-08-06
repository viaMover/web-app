<template>
  <content-wrapper
    has-back-button
    wrapper-class="not-found"
    @close="handleClose"
  >
    <div>
      <h1 class="title">404</h1>
      <p>{{ $t('txtNotFound') }}</p>
    </div>
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
      this.$router.back();
    }
  }
});
</script>
