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

import { formatToNative } from '@/utils/format';

export default Vue.extend({
  name: 'HeaderBalance',
  computed: {
    ...mapGetters('account', ['entireBalance']),
    balanceNative(): string {
      return `$${formatToNative(this.entireBalance)}`;
    }
  }
});
</script>
