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
import { mapState } from 'vuex';

import { fromWei } from '@/utils/bigmath';
import BigNumber from 'bignumber.js';

export default Vue.extend({
  name: 'HeaderBalance',
  computed: {
    ...mapState('account', ['balance']),
    formattedBalance(): string {
      // todo: should be $, rounded to 2 decimal places
      return new BigNumber(fromWei(this.balance, 18)).toFixed(6);
    }
  }
});
</script>
