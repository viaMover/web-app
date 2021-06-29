<template>
  <section
    class="general-desktop__menu-wrapper-balance"
    :name="$t('lblBalance')"
  >
    <span>{{ formattedBalance }}</span>
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
    formattedBalance(): string {
      // todo: should be $, rounded to 2 decimal places
      return new BigNumber(this.entireBalance).toFixed(6);
    }
  }
});
</script>
