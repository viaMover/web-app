<template>
  <section
    class="general-desktop__menu-wrapper-balance"
    :name="$t('lblBalance')"
  >
    <span>{{ balanceNative }}</span>
    <p>{{ $t('headingBalance') }}</p>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import BigNumber from 'bignumber.js';

export default Vue.extend({
  name: 'HeaderBalance',
  computed: {
    ...mapGetters('account', ['entireBalance']),
    balanceNative(): string {
      const balance = new BigNumber(this.entireBalance).toFixed(2);
      return `$${balance}`;
    }
  }
});
</script>
