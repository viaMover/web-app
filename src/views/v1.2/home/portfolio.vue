<template>
  <div class="portfolio">
    <div class="links">
      <router-link class="header link" :to="{ name: 'wallet' }">
        <h2>
          {{ $t('wallet') }}
          <span class="badge">{{ formattedWalletBalanceNative }}</span>
        </h2>
      </router-link>

      <router-link class="header link" :to="{ name: 'transactions' }">
        <h2>{{ $t('transactionHistory') }}</h2>
      </router-link>
    </div>

    <div class="banners">
      <banner />
    </div>

    <navigation-section />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import Banner from '@/components/v1.2/home/portfolio/banner/banner.vue';
import NavigationSection from '@/components/v1.2/home/portfolio/navigation-section/navigation-section.vue';

export default Vue.extend({
  components: {
    Banner,
    NavigationSection
  },
  computed: {
    ...mapGetters('account', {
      walletBalanceNative: 'entireBalance'
    }),
    formattedWalletBalanceNative(): string {
      return this.formatAsNativeCurrency(this.walletBalanceNative);
    }
  }
});
</script>
