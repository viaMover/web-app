<template>
  <content-wrapper class="logout" page-content-class="centered">
    <section class="container">
      <div>{{ $t('logout.lblLogout') }}</div>
    </section>
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

import { ContentWrapper } from '@/components/layout';

export default Vue.extend({
  name: 'Logout',
  components: {
    ContentWrapper
  },
  mounted() {
    this.fullLogout();
  },
  methods: {
    ...mapActions('account', {
      clearPersistStorage: 'clearPersistStorage',
      disconnectWallet: 'disconnectWallet'
    }),
    replaceRoute(): void {
      this.$router.replace({ name: 'connect-wallet' });
    },
    async fullLogout(): Promise<void> {
      await this.disconnectWallet();
      await this.clearPersistStorage();
      document.cookie.split(';').forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/');
      });
      setTimeout(() => this.replaceRoute(), 1000);
    }
  }
});
</script>
