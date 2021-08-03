<template>
  <section
    class="general-desktop__menu-wrapper-balance"
    :name="$t('lblBalance')"
  >
    <wallet-header-avatar />
    <button class="" type="button">
      <span>{{ $t('headingBalance') }}</span>
      <img
        :alt="$t('txtChangeWalletAlt')"
        src="@/assets/images/arrow-down.svg"
      />
    </button>
    <span>{{ balanceNative }}</span>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { formatToNative } from '@/utils/format';
import WalletHeaderAvatar from '@/components/wallet-info-rail/wallet-header-avatar.vue';

export default Vue.extend({
  name: 'HeaderBalance',
  components: {
    WalletHeaderAvatar
  },
  computed: {
    ...mapGetters('account', ['entireBalance']),
    balanceNative(): string {
      return `$${formatToNative(this.entireBalance)}`;
    }
  }
});
</script>
